# apps/attendance/views.py
from rest_framework.views import APIView
from mongoengine.errors import DoesNotExist
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from datetime import datetime
from .models import Elimination, Presence, Justificatif
from apps.accounts.models import AgentAdministratif, Etudiant, Enseignant
from apps.academic.models import Groupe, Matiere, Seance


class AbsencesNonJustifieesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            etudiant = Etudiant.objects.get(utilisateur=user)
        except Etudiant.DoesNotExist:
            return Response({"error": "Profil étudiant non trouvé"}, status=404)

        absences = Presence.objects(etudiant=etudiant, statut="absent")
        
        # Récupérer les IDs des justificatifs existants
        justificatifs = Justificatif.objects(etudiant=etudiant).only('presence')
        presence_ids_avec_justif = set()
        for j in justificatifs:
            if j.presence:
                presence_ids_avec_justif.add(str(j.presence.id))
        
        # Filtrer les absences non justifiées en ignorant celles dont la séance a disparu
        absences_non_justifiees = []
        for p in absences:
            try:
                # Forcer le dereferencement de la séance
                _ = p.seance
                if str(p.id) not in presence_ids_avec_justif:
                    absences_non_justifiees.append(p)
            except DoesNotExist:
                continue  # séance inexistante, on ignore cette présence
        
        data = []
        for p in absences_non_justifiees:
            seance = p.seance
            data.append({
                "id": str(p.id),
                "matiere": seance.matiere.nom,
                "type": seance.type_seance.upper(),
                "date": seance.date_seance.isoformat(),
                "heure": seance.heure_debut,
                "enseignant": seance.enseignant.utilisateur.nom_complet if seance.enseignant else "Non assigné"
            })
        return Response(data)


class JustificatifEtudiantView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            etudiant = Etudiant.objects.get(utilisateur=user)
        except Etudiant.DoesNotExist:
            return Response({"error": "Profil étudiant non trouvé"}, status=404)

        justificatifs = Justificatif.objects(etudiant=etudiant).order_by("-date_depot")
        data = []
        for j in justificatifs:
            try:
                if not j.presence:
                    continue
                seance = j.presence.seance
                # Forcer le dereferencement pour vérifier que la séance existe
                _ = seance.matiere.nom
                data.append({
                    "id": str(j.id),
                    "matiere": seance.matiere.nom,
                    "type": seance.type_seance.upper(),
                    "date": seance.date_seance.isoformat(),
                    "heure": seance.heure_debut,
                    "dateDepot": j.date_depot.isoformat(),
                    "motif": j.commentaire,
                    "fichier": j.fichier,
                    "statut": j.statut.upper(),
                    "commentaire": j.commentaire or ""
                })
            except DoesNotExist:
                # Séance manquante, on ignore ce justificatif
                continue
        return Response(data)

    def post(self, request):
        user = request.user
        try:
            etudiant = Etudiant.objects.get(utilisateur=user)
        except Etudiant.DoesNotExist:
            return Response({"error": "Profil étudiant non trouvé"}, status=404)

        presence_id = request.data.get("presence_id")
        motif = request.data.get("motif")
        fichier = request.FILES.get("fichier")

        if not presence_id or not motif or not fichier:
            return Response({"error": "presence_id, motif et fichier sont requis"}, status=400)

        try:
            presence = Presence.objects.get(id=presence_id, etudiant=etudiant)
        except Presence.DoesNotExist:
            return Response({"error": "Absence non trouvée"}, status=404)

        # Vérifier si un justificatif existe déjà pour cette absence
        if Justificatif.objects(presence=presence).first():
            return Response({"error": "Un justificatif a déjà été déposé pour cette absence"}, status=400)

        # Sauvegarde du fichier
        subdir = f"justificatifs/{etudiant.num_inscription}"
        os.makedirs(os.path.join(settings.MEDIA_ROOT, subdir), exist_ok=True)
        file_path = default_storage.save(os.path.join(subdir, fichier.name), ContentFile(fichier.read()))
        
        justificatif = Justificatif(
            etudiant=etudiant,
            presence=presence,
            commentaire=motif,
            fichier=file_path,
            statut="en_attente"
        )
        justificatif.save()

        return Response({"message": "Justificatif déposé avec succès", "id": str(justificatif.id)}, status=201)


class SeanceAppelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, seance_id):
        """
        Récupère les détails d'une séance et la liste des étudiants du groupe
        avec leur statut de présence actuel (si déjà enregistré).
        """
        try:
            seance = Seance.objects.get(id=seance_id)
        except Seance.DoesNotExist:
            return Response({"error": "Séance non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que l'utilisateur connecté est bien l'enseignant de cette séance
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
            if seance.enseignant and str(seance.enseignant.id) != str(enseignant.id):
                return Response({"error": "Vous n'êtes pas autorisé à modifier cette séance"}, status=403)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        # Récupérer le groupe et ses étudiants
        groupe = seance.groupe
        etudiants = Etudiant.objects(groupe=groupe)

        # Récupérer les présences déjà enregistrées pour cette séance
        presences = {str(p.etudiant.id): p.statut for p in Presence.objects(seance=seance)}

        # Construire la liste des étudiants avec leur statut actuel
        students_data = []
        for e in etudiants:
            status = presences.get(str(e.id), None)  # None = non encore enregistré
            students_data.append({
                "id": str(e.id),
                "name": e.utilisateur.nom_complet,
                "initials": e.utilisateur.prenom[0] + e.utilisateur.nom[0],
                "studentId": e.num_inscription,
                "status": status,  # 'present', 'absent', 'retard' ou null
            })

        data = {
            "seance": {
                "id": str(seance.id),
                "matiere": seance.matiere.nom,
                "type": seance.type_seance,
                "date": seance.date_seance.isoformat(),
                "heure_debut": seance.heure_debut,
                "heure_fin": seance.heure_fin,
                "groupe": str(groupe),
                "salle": "À définir",  # à adapter si vous avez un champ salle
                "appel_effectue": seance.appel_effectue,
            },
            "students": students_data
        }
        return Response(data)


class PresenceBulkUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        seance_id = request.data.get("seance_id")
        presences_data = request.data.get("presences", [])

        if not seance_id:
            return Response({"error": "seance_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            seance = Seance.objects.get(id=seance_id)
        except Seance.DoesNotExist:
            return Response({"error": "Séance non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que l'utilisateur est bien l'enseignant de cette séance
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
            if seance.enseignant and str(seance.enseignant.id) != str(enseignant.id):
                return Response({"error": "Vous n'êtes pas autorisé"}, status=403)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        updated_count = 0
        errors = []
        for item in presences_data:
            etudiant_id = item.get("etudiant_id")
            statut = item.get("statut")
            if not etudiant_id or statut not in ["present", "absent", "retard"]:
                errors.append(f"Données invalides: {item}")
                continue

            try:
                etudiant = Etudiant.objects.get(id=etudiant_id)
            except Etudiant.DoesNotExist:
                errors.append(f"Étudiant {etudiant_id} non trouvé")
                continue

            if str(etudiant.groupe.id) != str(seance.groupe.id):
                errors.append(f"Étudiant {etudiant_id} n'appartient pas au groupe de la séance")
                continue

            existing = Presence.objects(seance=seance, etudiant=etudiant).first()
            if existing:
                existing.statut = statut
                existing.date_enregistrement = datetime.now()
                existing.save()
            else:
                Presence(
                    seance=seance,
                    etudiant=etudiant,
                    statut=statut,
                    date_enregistrement=datetime.now()
                ).save()
            updated_count += 1

        if not seance.appel_effectue:
            seance.appel_effectue = True
            seance.save()

        return Response({
            "message": f"{updated_count} présences enregistrées",
            "errors": errors
        }, status=status.HTTP_200_OK)
# apps/attendance/views.py (ajouter à la fin)

class EnseignantJustificatifsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        # Récupérer les séances de l'enseignant
        seances = Seance.objects(enseignant=enseignant)
        # Récupérer les présences de ces séances
        presences = Presence.objects(seance__in=seances)
        # Récupérer les justificatifs liés à ces présences
        justificatifs = Justificatif.objects(presence__in=presences).order_by("-date_depot")

        # Filtrer par statut si demandé
        statut_filtre = request.query_params.get("statut")
        if statut_filtre and statut_filtre in ["en_attente", "valide", "refuse"]:
            justificatifs = justificatifs.filter(statut=statut_filtre)

        data = []
        for j in justificatifs:
            presence = j.presence
            seance = presence.seance
            etudiant = j.etudiant
            data.append({
                "id": str(j.id),
                "studentName": etudiant.utilisateur.nom_complet,
                "studentId": etudiant.num_inscription,
                "group": f"Groupe {seance.groupe.num_groupe} - {seance.groupe.filiere.code}",
                "initials": etudiant.utilisateur.prenom[0] + etudiant.utilisateur.nom[0],
                "status": j.statut,   # 'en_attente', 'valide', 'refuse'
                "absenceDate": f"{seance.date_seance.strftime('%d %B %Y')}, {seance.heure_debut}",
                "course": f"{seance.matiere.nom} - {seance.get_type_seance_display()}",
                "submittedAt": j.date_depot.strftime("%d %B, %H:%M"),
                "message": j.commentaire if j.commentaire else "",
                "document": {
                    "name": j.fichier.split('/')[-1] if j.fichier else "Aucun fichier",
                    "size": "Document",  # peut être calculé
                    "type": "PDF Document" if j.fichier.endswith('.pdf') else "Image",
                    "url": j.fichier,
                }
            })
        return Response(data)


class TraiterJustificatifView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, justificatif_id):
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        try:
            justificatif = Justificatif.objects.get(id=justificatif_id)
        except Justificatif.DoesNotExist:
            return Response({"error": "Justificatif non trouvé"}, status=404)

        # Vérifier que le justificatif est bien lié à une séance de cet enseignant
        seance = justificatif.presence.seance
        if not seance.enseignant or str(seance.enseignant.id) != str(enseignant.id):
            return Response({"error": "Vous n'êtes pas autorisé à traiter ce justificatif"}, status=403)

        action = request.data.get("action")   # 'approve' ou 'reject'
        commentaire = request.data.get("commentaire", "")

        if action not in ["approve", "reject"]:
            return Response({"error": "Action invalide. Utilisez 'approve' ou 'reject'."}, status=400)

        if action == "approve":
            justificatif.valider(enseignant, commentaire)
            message = "Justificatif validé avec succès"
        else:
            justificatif.refuser(enseignant, commentaire)
            message = "Justificatif refusé"

        # Optionnel : si vous voulez mettre à jour la présence (par ex. changer 'absent' en 'justifié'),
        # vous pouvez ajouter une logique ici. Pour l’instant, on laisse le statut 'absent',
        # mais un justificatif validé existe.

        return Response({"message": message}, status=200)
# apps/attendance/views.py (ajouter à la fin)

from datetime import datetime

class EliminationsAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        statut = request.query_params.get("statut")  # 'en_cours' ou 'confirmee'
        if statut in ['en_cours', 'confirmee']:
            eliminations = Elimination.objects(statut=statut).order_by("-date_elimination")
        else:
            eliminations = Elimination.objects.all().order_by("-date_elimination")

        data = []
        for e in eliminations:
            etudiant = e.etudiant
            matiere = e.matiere
            # Calcul du taux d'absence dans cette matière
            seances = Seance.objects(matiere=matiere, groupe=etudiant.groupe)
            total_seances = seances.count()
            if total_seances > 0:
                absences = Presence.objects(etudiant=etudiant, seance__in=seances, statut="absent").count()
                taux_absence = round((absences / total_seances) * 100, 1)
            else:
                absences = 0
                taux_absence = 0

            data.append({
                "id": str(e.id),
                "statut": e.statut,
                "etudiant": {
                    "nom": etudiant.utilisateur.nom_complet,
                    "numero": etudiant.num_inscription,
                    "photo": (etudiant.utilisateur.prenom[0] + etudiant.utilisateur.nom[0]).upper(),
                    "departement": matiere.filiere.departement.nom,
                    "groupe": f"Groupe {etudiant.groupe.num_groupe} - {etudiant.groupe.filiere.code}" if etudiant.groupe else ""
                },
                "matiere": matiere.nom,
                "code": matiere.code,
                "nbAbsences": absences,
                "seuil": matiere.seuil_absence,
                "tauxAbsence": taux_absence,
                "dateDetection": e.date_elimination.strftime("%Y-%m-%d"),
                "dateElimination": e.date_elimination.strftime("%Y-%m-%d"),
                "motif": e.motif or ""
            })
        return Response(data)


class ConfirmerEliminationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, elimination_id):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        try:
            elimination = Elimination.objects.get(id=elimination_id)
        except Elimination.DoesNotExist:
            return Response({"error": "Élimination non trouvée"}, status=404)

        motif = request.data.get("motif", "")
        # Récupérer l'agent administratif lié à cet utilisateur
        try:
            agent = AgentAdministratif.objects.get(utilisateur=user)
        except AgentAdministratif.DoesNotExist:
            agent = None

        elimination.marquer_elimine(agent, motif)
        return Response({"message": "Élimination confirmée avec succès"})


class AnnulerEliminationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, elimination_id):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        try:
            elimination = Elimination.objects.get(id=elimination_id)
        except Elimination.DoesNotExist:
            return Response({"error": "Élimination non trouvée"}, status=404)

        elimination.annuler()
        return Response({"message": "Élimination annulée avec succès"})


class DetecterEliminationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        nouvelles = 0
        matieres = Matiere.objects.all()
        for matiere in matieres:
            groupes = Groupe.objects(filiere=matiere.filiere)
            for groupe in groupes:
                etudiants = Etudiant.objects(groupe=groupe)
                seances = Seance.objects(matiere=matiere, groupe=groupe)
                total_seances = seances.count()
                if total_seances == 0:
                    continue
                for etudiant in etudiants:
                    absences = Presence.objects(etudiant=etudiant, seance__in=seances, statut="absent").count()
                    if absences >= matiere.seuil_absence:
                        # Vérifier si une élimination existe déjà (en cours ou confirmée)
                        existing = Elimination.objects(etudiant=etudiant, matiere=matiere, statut__in=["en_cours", "confirmee"]).first()
                        if not existing:
                            Elimination(
                                etudiant=etudiant,
                                matiere=matiere,
                                motif="Dépassement du seuil d'absence",
                                statut="en_cours",
                                date_elimination=datetime.now().date()
                            ).save()
                            nouvelles += 1
        return Response({"message": f"{nouvelles} nouvelle(s) élimination(s) détectée(s)"})
# apps/attendance/views.py (ajouter à la fin)

from django.core.mail import send_mail
from django.conf import settings

class NotifierEtudiantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, elimination_id):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        try:
            elimination = Elimination.objects.get(id=elimination_id)
        except Elimination.DoesNotExist:
            return Response({"error": "Élimination non trouvée"}, status=404)

        etudiant = elimination.etudiant
        matiere = elimination.matiere
        seuil = matiere.seuil_absence

        # Calculer le nombre d'absences actuel
        seances = Seance.objects(matiere=matiere, groupe=etudiant.groupe)
        absences = Presence.objects(etudiant=etudiant, seance__in=seances, statut="absent").count()

        sujet = f"Alerte élimination - {matiere.nom}"
        message = f"""
Bonjour {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom},

Vous etes actuellement en situation critique dans la matiere **{matiere.nom}**.
Votre nombre d'absences est de **{absences}** sur un seuil de **{seuil}** autorisees.

Si vous ne justifiez pas vos absences dans les plus brefs delais, vous risquez l'elimination definitive.

Veuillez vous rapprocher de votre professeur ou du secretariat pedagogique pour regulariser votre situation.

Cordialement,
Service de la scolarite
"""

        try:
            send_mail(
                subject=sujet,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[etudiant.utilisateur.email],
                fail_silently=False,
            )
            return Response({"message": "Email envoyé avec succès"})
        except Exception as e:
            return Response({"error": f"Erreur lors de l'envoi : {str(e)}"}, status=500)