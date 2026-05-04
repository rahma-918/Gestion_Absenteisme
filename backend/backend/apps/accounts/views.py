# apps/accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, datetime, timedelta

from .serializers import SignupSerializer, LoginSerializer
from .models import Etudiant, Enseignant
from apps.academic.models import Departement, Filiere, Matiere, Seance, Groupe
from apps.attendance.models import Elimination, Presence, Justificatif
from apps.notifications.models import Alerte
from collections import defaultdict
from django.db.models import Sum, Count, Q


class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'nom_complet': user.nom_complet,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'nom_complet': user.nom_complet,
                    'role': user.role
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EtudiantDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            etudiant = Etudiant.objects.get(utilisateur=user)
        except Etudiant.DoesNotExist:
            return Response({"error": "Profil étudiant non trouvé"}, status=404)

        groupe = etudiant.groupe
        if not groupe:
            return Response({"error": "Étudiant non affecté à un groupe"}, status=400)

        seances = Seance.objects(groupe=groupe)
        total_seances = seances.count()

        presences = Presence.objects(etudiant=etudiant)
        absences_total = presences.filter(statut="absent").count()
        presents = presences.filter(statut="present").count()
        taux_presence = round((presents / total_seances * 100), 1) if total_seances > 0 else 0

        matieres = Matiere.objects(filiere=groupe.filiere)
        nb_matieres = matieres.count()

        matieres_stats = []
        for matiere in matieres:
            seances_matiere = seances.filter(matiere=matiere)
            nb_seances = seances_matiere.count()
            nb_absences = presences.filter(seance__in=seances_matiere, statut="absent").count()
            seuil = matiere.seuil_absence
            taux = round((nb_seances - nb_absences) / nb_seances * 100, 1) if nb_seances > 0 else 0

            if nb_absences < seuil:
                status = "ok"
            elif nb_absences == seuil:
                status = "warning"
            else:
                status = "danger"

            matieres_stats.append({
                "nom": matiere.nom,
                "code": matiere.code,
                "nbSeances": nb_seances,
                "nbAbsences": nb_absences,
                "seuil": seuil,
                "taux": taux,
                "status": status
            })

        alertes = Alerte.objects(etudiant=etudiant, est_lue=False).order_by("-date_generation")
        alertes_data = [{
            "type": a.type,
            "matiere": a.matiere.nom if a.matiere else None,
            "message": a.message,
            "date": a.date_generation.strftime("%d/%m/%Y")
        } for a in alertes]

        aujourd_hui = datetime.now().date()
        prochaines_seances = seances.filter(date_seance__gte=aujourd_hui).order_by("date_seance", "heure_debut")[:5]
        prochains_cours = [{
            "matiere": s.matiere.nom,
            "type": s.type_seance.upper(),
            "date_iso": s.date_seance.isoformat(),
            "heure": f"{s.heure_debut} - {s.heure_fin}",
        } for s in prochaines_seances]

        stats = [
            {
                "value": f"{taux_presence}%",
                "label": "Taux de présence global",
                "icon": "✓",
                "iconClass": "green",
                "trend": "Excellent niveau d'assiduité" if taux_presence >= 90 else "Assiduité à améliorer",
                "trendClass": "trend-up" if taux_presence >= 90 else "trend-warning"
            },
            {
                "value": str(nb_matieres),
                "label": "Matières suivies",
                "icon": "📚",
                "iconClass": "blue",
                "trend": "Ce semestre",
                "trendClass": "trend-neutral"
            },
            {
                "value": str(presents),
                "label": "Séances suivies",
                "icon": "📅",
                "iconClass": "blue",
                "trend": "Depuis le début du semestre",
                "trendClass": "trend-neutral"
            },
            {
                "value": str(absences_total),
                "label": "Absences totales",
                "icon": "⚠️",
                "iconClass": "orange",
                "trend": f"{absences_total} absence{'s' if absences_total != 1 else ''}",
                "trendClass": "trend-warning" if absences_total > 0 else "trend-up"
            }
        ]

        return Response({
            "stats": stats,
            "matieres": matieres_stats,
            "alertes": alertes_data,
            "prochains_cours": prochains_cours
        })


class EnseignantDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        seances = Seance.objects(enseignant=enseignant)

        # Groupes distincts
        groupes_ids = set()
        for s in seances:
            if s.groupe:
                groupes_ids.add(s.groupe.id)
        nb_groupes = len(groupes_ids)
        groupes = Groupe.objects(id__in=list(groupes_ids))

        from apps.accounts.models import Etudiant
        etudiants = Etudiant.objects(groupe__in=groupes)
        nb_etudiants = etudiants.count()

        # Taux de présence moyen
        presences = Presence.objects(seance__in=seances)
        total_presences = presences.count()
        if total_presences > 0:
            presents_et_retards = presences.filter(statut__in=["present", "retard"]).count()
            taux_moyen = round((presents_et_retards / total_presences) * 100, 1)
        else:
            taux_moyen = 0

        # Récupérer les IDs des présences pour les justificatifs
        presences_concernees = Presence.objects(seance__in=seances)
        presence_ids = [str(p.id) for p in presences_concernees]

        # Alertes actives (justificatifs en attente)
        justificatifs_attente = Justificatif.objects(presence__in=presence_ids, statut="en_attente")
        nb_alertes = justificatifs_attente.count()

        # Justificatifs récents (les 5 premiers pour le dashboard)
        justificatifs_recents = justificatifs_attente.order_by("-date_depot")[:5]
        justificatifs_data = []
        for j in justificatifs_recents:
            etudiant = j.etudiant
            justificatifs_data.append({
                "id": str(j.id),
                "etudiant": etudiant.utilisateur.nom_complet,
                "numero": etudiant.num_inscription,
                "matiere": j.presence.seance.matiere.nom if j.presence else "N/A",
                "dateDepot": j.date_depot.strftime("%d %B %Y")
            })

        # Statistiques pour les cartes KPI
        stats = [
            {
                "value": str(nb_groupes),
                "label": "Groupes assignés",
                "icon": "👥",
                "iconClass": "blue",
                "trend": f"{nb_groupes} groupes ce semestre",
                "trendClass": "trend-up"
            },
            {
                "value": str(nb_etudiants),
                "label": "Étudiants total",
                "icon": "🎓",
                "iconClass": "green",
                "trend": "Effectif sous votre responsabilité",
                "trendClass": "trend-up"
            },
            {
                "value": f"{taux_moyen}%",
                "label": "Taux de présence moyen",
                "icon": "✓",
                "iconClass": "green",
                "trend": "Assiduité générale",
                "trendClass": "trend-up"
            },
            {
                "value": str(nb_alertes),
                "label": "Alertes actives",
                "icon": "⚠️",
                "iconClass": "orange",
                "trend": f"{nb_alertes} justificatifs en attente",
                "trendClass": "trend-down" if nb_alertes > 0 else "trend-up"
            }
        ]

        # Séances récentes
        recentes = seances.order_by("-date_seance", "-heure_debut")[:5]
        sessions_data = []
        for s in recentes:
            nb_etudiants_groupe = Etudiant.objects(groupe=s.groupe).count()
            sessions_data.append({
                "title": f"{s.matiere.nom} - {s.get_type_seance_display()}",
                "date": f"📅 {s.date_seance.strftime('%d/%m/%Y')}, {s.heure_debut} - {s.heure_fin}",
                "group": f"👥 Groupe {s.groupe.num_groupe} - {s.groupe.filiere.code}",
                "students": f"👤 {nb_etudiants_groupe} étudiants",
                "badge": "success" if s.appel_effectue else "warning",
                "badgeText": "Appel effectué" if s.appel_effectue else "En attente",
                "id": str(s.id)
            })

        # Actions rapides
        quick_actions = [
            {
                "icon": "✓",
                "title": "Faire l'appel",
                "description": "Enregistrer les présences",
                "link": "/appel"
            },
            {
                "icon": "📊",
                "title": "Statistiques",
                "description": "Voir les rapports détaillés",
                "link": "/statistiques"
            },
            {
                "icon": "📄",
                "title": "Justificatifs",
                "description": f"{nb_alertes} en attente de validation",
                "link": "/justificatifs"
            },
        ]

        return Response({
            "stats": stats,
            "sessions": sessions_data,
            "quickActions": quick_actions,
            "enseignant": {
                "id": str(enseignant.id),
                "nom_complet": enseignant.utilisateur.nom_complet,
                "specialite": enseignant.specialite
            },
            "justificatifsRecents": justificatifs_data
        })

class EnseignantAttendanceEvolutionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        seances = Seance.objects(enseignant=enseignant)
        aujourd_hui = datetime.now().date()
        seances_passees = [s for s in seances if s.date_seance <= aujourd_hui]
        if not seances_passees:
            return Response({"labels": [], "values": []})

        weeks_data = defaultdict(lambda: {"total": 0, "present": 0})
        for s in seances_passees:
            week_number = s.date_seance.isocalendar()[1]
            year = s.date_seance.year
            key = f"{year}-W{week_number:02d}"
            presences = Presence.objects(seance=s)
            total_etudiants = presences.count()
            if total_etudiants == 0:
                continue
            presents = presences.filter(statut="present").count()
            retards = presences.filter(statut="retard").count()
            weeks_data[key]["total"] += total_etudiants
            weeks_data[key]["present"] += (presents + retards)

        labels = []
        values = []
        for key in sorted(weeks_data.keys()):
            data = weeks_data[key]
            taux = round((data["present"] / data["total"]) * 100, 1)
            labels.append(key)
            values.append(taux)

        return Response({"labels": labels, "values": values})


class EnseignantStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            enseignant = Enseignant.objects.get(utilisateur=user)
        except Enseignant.DoesNotExist:
            return Response({"error": "Profil enseignant non trouvé"}, status=404)

        seances = Seance.objects(enseignant=enseignant)
        if not seances:
            return Response({
                "overview": {},
                "topStudents": [],
                "groupComparison": [],
                "alerts": [],
                "evolution": {"labels": [], "values": []}
            })

        presences_toutes = Presence.objects(seance__in=seances)
        total_presences = presences_toutes.count()
        if total_presences > 0:
            presents = presences_toutes.filter(statut="present").count()
            retards = presences_toutes.filter(statut="retard").count()
            global_rate = round(((presents + retards) / total_presences) * 100, 1)
        else:
            global_rate = 0

        sessions_count = seances.filter(appel_effectue=True).count()
        total_absences = presences_toutes.filter(statut="absent").count()

        groupes = Groupe.objects(id__in=set([s.groupe.id for s in seances]))
        etudiants = Etudiant.objects(groupe__in=groupes)
        at_risk_count = 0
        matieres_enseignant = set([s.matiere.id for s in seances])
        for etudiant in etudiants:
            for matiere_id in matieres_enseignant:
                seances_matiere = Seance.objects(groupe=etudiant.groupe, matiere=matiere_id)
                absences_matiere = Presence.objects(etudiant=etudiant, seance__in=seances_matiere, statut="absent").count()
                seuil = Matiere.objects.get(id=matiere_id).seuil_absence
                if absences_matiere >= seuil * 0.8:
                    at_risk_count += 1
                    break

        overview = {
            "globalRate": global_rate,
            "trendRate": "+2.3% vs mois dernier",
            "sessionsCount": sessions_count,
            "totalAbsences": total_absences,
            "absencesTrend": "-18 vs mois dernier",
            "atRiskStudents": at_risk_count,
        }

        student_rates = []
        for etudiant in etudiants:
            pres_etudiant = presences_toutes.filter(etudiant=etudiant)
            total = pres_etudiant.count()
            if total > 0:
                present_retard = pres_etudiant.filter(statut__in=["present", "retard"]).count()
                rate = round((present_retard / total) * 100, 1)
                student_rates.append({
                    "etudiant": etudiant,
                    "rate": rate,
                    "name": etudiant.utilisateur.nom_complet,
                    "id": etudiant.num_inscription,
                })
        student_rates.sort(key=lambda x: x["rate"], reverse=True)
        top_students = []
        for idx, s in enumerate(student_rates[:5], 1):
            top_students.append({
                "rank": idx,
                "name": s["name"],
                "id": s["id"],
                "rate": s["rate"]
            })

        group_comparison = []
        for groupe in groupes:
            etudiants_groupe = Etudiant.objects(groupe=groupe)
            total_pres_groupe = 0
            total_present_retard = 0
            for etudiant in etudiants_groupe:
                pres_et = presences_toutes.filter(etudiant=etudiant)
                total_pres_groupe += pres_et.count()
                present_retard = pres_et.filter(statut__in=["present", "retard"]).count()
                total_present_retard += present_retard
            if total_pres_groupe > 0:
                rate = round((total_present_retard / total_pres_groupe) * 100, 1)
            else:
                rate = 0
            group_comparison.append({
                "name": f"Groupe {groupe.num_groupe} - {groupe.filiere.code}",
                "rate": rate
            })

        alerts = []
        for etudiant in etudiants:
            for matiere_id in matieres_enseignant:
                seances_matiere = Seance.objects(groupe=etudiant.groupe, matiere=matiere_id)
                absences = Presence.objects(etudiant=etudiant, seance__in=seances_matiere, statut="absent").count()
                seuil = Matiere.objects.get(id=matiere_id).seuil_absence
                if absences >= seuil:
                    severity = "critical"
                    message = f"Dépassement du seuil - {absences} absences / {seuil} autorisées"
                elif absences >= seuil * 0.8:
                    severity = "warning"
                    message = f"Approche du seuil - {absences} absences / {seuil} autorisées"
                else:
                    continue
                alerts.append({
                    "student": f"{etudiant.utilisateur.nom_complet} ({etudiant.num_inscription})",
                    "message": message,
                    "severity": severity
                })
                break
        alerts = alerts[:10]

        evolution_data = self._get_evolution_data(seances)

        return Response({
            "overview": overview,
            "topStudents": top_students,
            "groupComparison": group_comparison,
            "alerts": alerts,
            "evolution": evolution_data
        })

    def _get_evolution_data(self, seances):
        aujourd_hui = datetime.now().date()
        seances_passees = [s for s in seances if s.date_seance <= aujourd_hui]
        if not seances_passees:
            return {"labels": [], "values": []}

        weeks_data = defaultdict(lambda: {"total": 0, "present": 0})
        for s in seances_passees:
            week_number = s.date_seance.isocalendar()[1]
            year = s.date_seance.year
            key = f"{year}-W{week_number:02d}"
            presences = Presence.objects(seance=s)
            total_etudiants = presences.count()
            if total_etudiants == 0:
                continue
            presents = presences.filter(statut="present").count()
            retards = presences.filter(statut="retard").count()
            weeks_data[key]["total"] += total_etudiants
            weeks_data[key]["present"] += (presents + retards)

        labels = []
        values = []

        def get_monday_of_iso_week(year, week):
            jan4 = datetime(year, 1, 4).date()
            monday_of_week1 = jan4 - timedelta(days=jan4.weekday())
            return monday_of_week1 + timedelta(weeks=week - 1)

        for key in sorted(weeks_data.keys()):
            year_week = key.split('-W')
            year = int(year_week[0])
            week = int(year_week[1])
            monday = get_monday_of_iso_week(year, week)
            sunday = monday + timedelta(days=6)
            label = f"Semaine {week} ({monday.strftime('%d/%m')} - {sunday.strftime('%d/%m')})"
            data = weeks_data[key]
            taux = round((data["present"] / data["total"]) * 100, 1)
            labels.append(label)
            values.append(taux)

        return {"labels": labels, "values": values}
# apps/accounts/views.py (ajouter à la fin)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Vérifier que l'utilisateur a le rôle 'admin' (AgentAdministratif)
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        # --- 1. Statistiques globales ---
        # Nombre de départements
        nb_departements = Departement.objects.count()

        # Nombre de groupes actifs (tous les groupes)
        nb_groupes = Groupe.objects.count()

        # Nombre d'étudiants inscrits
        nb_etudiants = Etudiant.objects.count()

        # Taux de présence global : (total présents + retards) / (total présences)
        total_presences = Presence.objects.count()
        if total_presences > 0:
            presents_et_retards = Presence.objects(statut__in=["present", "retard"]).count()
            taux_global = round((presents_et_retards / total_presences) * 100, 1)
        else:
            taux_global = 0

        # Nombre d'alertes actives : justificatifs en attente + étudiants à risque (dépassement seuil)
        # Pour simplifier, on peut compter les justificatifs en attente
        nb_alertes = Justificatif.objects(statut="en_attente").count()
        # Étudiants à risque : ceux avec au moins une matière où absences >= 80% du seuil
        # On peut calculer plus tard, pour l'instant compter les justificatifs comme "actifs"

        # Nombre d'éliminations confirmées cette année (ou ce semestre)
        # Nombre d'éliminations confirmées cette année
        from datetime import date
        aujourd_hui = date.today()
        debut_annee = date(aujourd_hui.year, 1, 1)
        fin_annee = date(aujourd_hui.year, 12, 31)
        nb_eliminations = Elimination.objects(date_elimination__gte=debut_annee, date_elimination__lte=fin_annee, statut="confirmee").count()

        stats = [
            {"value": str(nb_departements), "label": "Départements", "icon": "🏢", "iconClass": "blue", "trend": "Vue d'ensemble", "trendClass": "trend-neutral"},
            {"value": str(nb_groupes), "label": "Groupes actifs", "icon": "👥", "iconClass": "blue", "trend": "Année 2025-2026", "trendClass": "trend-neutral"},
            {"value": str(nb_etudiants), "label": "Étudiants inscrits", "icon": "🎓", "iconClass": "green", "trend": f"+{round(nb_etudiants*0.03)} vs année dernière", "trendClass": "trend-up"},
            {"value": f"{taux_global}%", "label": "Taux de présence global", "icon": "✓", "iconClass": "success", "trend": "+1.2% vs mois dernier", "trendClass": "trend-up"},
            {"value": str(nb_alertes), "label": "Alertes actives", "icon": "⚠️", "iconClass": "orange", "trend": f"{nb_alertes} justificatifs en attente", "trendClass": "trend-warning"},
            {"value": str(nb_eliminations), "label": "Éliminations", "icon": "🚫", "iconClass": "red", "trend": "Ce semestre", "trendClass": "trend-danger"}
        ]

        # --- 2. Statistiques par département ---
        departements = Departement.objects.all()
        departements_stats = []
        for dept in departements:
            filieres = Filiere.objects(departement=dept)
            groupes = Groupe.objects(filiere__in=filieres)
            etudiants = Etudiant.objects(groupe__in=groupes)
            # Calculer le taux de présence pour ce département
            seances = Seance.objects(groupe__in=groupes)
            presences_dept = Presence.objects(seance__in=seances)
            total = presences_dept.count()
            if total > 0:
                presents_retards = presences_dept.filter(statut__in=["present", "retard"]).count()
                taux = round((presents_retards / total) * 100, 1)
            else:
                taux = 0
            # Alertes : justificatifs en attente pour les étudiants du département
            alertes = Justificatif.objects(etudiant__in=etudiants, statut="en_attente").count()
            # Éliminations confirmées pour les étudiants du département
            eliminations = Elimination.objects(etudiant__in=etudiants, statut="confirmee").count()
            departements_stats.append({
                "nom": dept.nom,
                "taux": taux,
                "alertes": alertes,
                "eliminations": eliminations
            })

        # --- 3. Alertes critiques (étudiants ayant dépassé le seuil d'absence) ---
        alertes_critiques = []
        seuil_critique = 1.0  # 100% du seuil
        # On recherche les étudiants avec au moins une matière où absences >= seuil
        matieres = Matiere.objects.all()
        for matiere in matieres:
            groupes_matiere = Groupe.objects(filiere=matiere.filiere)
            for groupe in groupes_matiere:
                seances_matiere = Seance.objects(matiere=matiere, groupe=groupe)
                etudiants_groupe = Etudiant.objects(groupe=groupe)
                for etudiant in etudiants_groupe:
                    absences = Presence.objects(etudiant=etudiant, seance__in=seances_matiere, statut="absent").count()
                    if absences >= matiere.seuil_absence * seuil_critique:
                        alertes_critiques.append({
                            "etudiant": etudiant.utilisateur.nom_complet,
                            "numero": etudiant.num_inscription,
                            "departement": matiere.filiere.departement.nom,
                            "nbAbsences": absences,
                            "seuil": matiere.seuil_absence,
                            "matiere": matiere.nom
                        })
                        break  # une seule alerte par étudiant suffit
        # Limiter aux 5 premières
        alertes_critiques = alertes_critiques[:5]

        # --- 4. Justificatifs en attente récents ---
        justificatifs = Justificatif.objects(statut="en_attente").order_by("-date_depot")[:5]
        justificatifs_en_attente = []
        for j in justificatifs:
            justificatifs_en_attente.append({
                "etudiant": j.etudiant.utilisateur.nom_complet,
                "numero": j.etudiant.num_inscription,
                "matiere": j.presence.seance.matiere.nom if j.presence else "N/A",
                "dateDepot": j.date_depot.strftime("%d %B %Y"),
                "departement": j.etudiant.groupe.filiere.departement.nom if j.etudiant.groupe else "Non défini"
            })

        return Response({
            "stats": stats,
            "departementsStats": departements_stats,
            "alertesCritiques": alertes_critiques,
            "justificatifsEnAttente": justificatifs_en_attente
        })

class AdminStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'admin':
            return Response({"error": "Accès réservé aux administrateurs"}, status=403)

        # --- KPI globaux ---
        total_etudiants = Etudiant.objects.count()
        total_absences = Presence.objects(statut="absent").count()
        total_alertes = Justificatif.objects(statut="en_attente").count()  # ou une autre métrique
        aujourd_hui = date.today()
        debut_semestre = date(aujourd_hui.year, 1, 1) if aujourd_hui.month < 7 else date(aujourd_hui.year, 7, 1)
        eliminations_semestre = Elimination.objects(
            date_elimination__gte=debut_semestre,
            statut="confirmee"
        ).count()

        # Taux de présence global
        total_presences = Presence.objects.count()
        if total_presences > 0:
            presents_retards = Presence.objects(statut__in=["present", "retard"]).count()
            taux_global = round((presents_retards / total_presences) * 100, 1)
        else:
            taux_global = 0

        # Évolution mensuelle (sur les 7 derniers mois)
        monthly_data = []
        for i in range(6, -1, -1):
            mois = aujourd_hui.replace(day=1) - timedelta(days=i*30)
            debut_mois = date(mois.year, mois.month, 1)
            fin_mois = date(mois.year, mois.month, 28)  # simplifié, on peut calculer dernier jour
            if mois.month == 2:
                fin_mois = date(mois.year, mois.month, 28)
            else:
                fin_mois = date(mois.year, mois.month, 30) if mois.month in [4,6,9,11] else date(mois.year, mois.month, 31)
            seances_mois = Seance.objects(date_seance__gte=debut_mois, date_seance__lte=fin_mois)
            presences_mois = Presence.objects(seance__in=seances_mois)
            total_mois = presences_mois.count()
            if total_mois > 0:
                presents_mois = presences_mois.filter(statut__in=["present", "retard"]).count()
                taux_mois = round((presents_mois / total_mois) * 100, 1)
            else:
                taux_mois = 0
            absences_mois = presences_mois.filter(statut="absent").count()
            eliminations_mois = Elimination.objects(date_elimination__gte=debut_mois, date_elimination__lte=fin_mois, statut="confirmee").count()
            monthly_data.append({
                "mois": debut_mois.strftime("%b"),
                "taux": taux_mois,
                "absences": absences_mois,
                "eliminations": eliminations_mois
            })

        # --- Filières (départements) ---
        departements = Departement.objects.all()
        filieres_data = []
        for dept in departements:
            filieres_dept = Filiere.objects(departement=dept)
            groupes = Groupe.objects(filiere__in=filieres_dept)
            etudiants = Etudiant.objects(groupe__in=groupes)
            nb_etudiants = etudiants.count()
            nb_groupes = groupes.count()
            seances = Seance.objects(groupe__in=groupes)
            presences_dept = Presence.objects(seance__in=seances)
            total = presences_dept.count()
            if total > 0:
                presents_retards = presences_dept.filter(statut__in=["present", "retard"]).count()
                taux = round((presents_retards / total) * 100, 1)
            else:
                taux = 0
            absences_dept = presences_dept.filter(statut="absent").count()
            alertes_dept = Justificatif.objects(etudiant__in=etudiants, statut="en_attente").count()
            eliminations_dept = Elimination.objects(etudiant__in=etudiants, statut="confirmee").count()
            filieres_data.append({
                "nom": dept.nom,
                "code": dept.nom[:4].upper(),
                "etudiants": nb_etudiants,
                "groupes": nb_groupes,
                "taux": taux,
                "absences": absences_dept,
                "eliminations": eliminations_dept,
                "alertes": alertes_dept
            })

        # Trier par taux décroissant pour le classement
        filieres_data.sort(key=lambda x: x["taux"], reverse=True)

        # --- Répartition des absences par type de séance ---
        seances_cours = Seance.objects(type_seance="cours")
        seances_td = Seance.objects(type_seance="td")
        seances_tp = Seance.objects(type_seance="tp")

        absences_cours = Presence.objects(seance__in=[s.id for s in seances_cours], statut="absent").count()
        absences_td = Presence.objects(seance__in=[s.id for s in seances_td], statut="absent").count()
        absences_tp = Presence.objects(seance__in=[s.id for s in seances_tp], statut="absent").count()
        absences_by_type = [
            {"type": "Cours", "nombre": absences_cours},
            {"type": "TD", "nombre": absences_td},
            {"type": "TP", "nombre": absences_tp}
        ]

        # --- Justificatifs ---
        justifs_valides = Justificatif.objects(statut="valide").count()
        justifs_attente = Justificatif.objects(statut="en_attente").count()
        justifs_refuses = Justificatif.objects(statut="refuse").count()
        justif_status = [
            {"name": "Validés", "value": justifs_valides, "color": "#18a76a"},
            {"name": "En attente", "value": justifs_attente, "color": "#e89b1a"},
            {"name": "Refusés", "value": justifs_refuses, "color": "#e14b4b"}
        ]

        # --- Radar data : taux assiduité et risque pour les 5 meilleures filières ---
        radar_data = []
        for f in filieres_data[:5]:
            risque = round(100 - f["taux"] + (f["alertes"] / max(f["etudiants"], 1)) * 10, 1)
            radar_data.append({
                "filiere": f["code"],
                "Assiduité": f["taux"],
                "Risque": risque
            })

        # --- Étudiants à risque (dépassement du seuil dans au moins une matière) ---
        etudiants_tous = Etudiant.objects.all()
        at_risk = []
        for etudiant in etudiants_tous[:20]:  # limit pour performance
            matieres = Matiere.objects(filiere=etudiant.groupe.filiere) if etudiant.groupe else []
            for matiere in matieres:
                seances_matiere = Seance.objects(matiere=matiere, groupe=etudiant.groupe)
                absences = Presence.objects(etudiant=etudiant, seance__in=seances_matiere, statut="absent").count()
                if absences >= matiere.seuil_absence:
                    niveau = "critical"
                elif absences >= matiere.seuil_absence * 0.8:
                    niveau = "high"
                else:
                    continue
                at_risk.append({
                    "initials": (etudiant.utilisateur.prenom[0] + etudiant.utilisateur.nom[0]).upper(),
                    "nom": etudiant.utilisateur.nom_complet,
                    "filiere": matiere.filiere.code,
                    "groupe": f"Groupe {etudiant.groupe.num_groupe}" if etudiant.groupe else "-",
                    "absences": absences,
                    "seuil": matiere.seuil_absence,
                    "level": niveau
                })
                break  # un seul risque par étudiant
        at_risk = at_risk[:10]  # top 10

        # --- Évolution hebdomadaire par filière (exemple pour 4 filières sur 8 semaines) ---
        # On prend les 8 dernières semaines
        weekly_attendance = []
        for i in range(7, -1, -1):
            semaine_debut = aujourd_hui - timedelta(weeks=i+1)
            semaine_fin = semaine_debut + timedelta(days=6)
            row = {"sem": f"S{i+1}"}
            for dept in departements[:4]:  # 4 premiers départements
                filieres_dept = Filiere.objects(departement=dept)
                groupes = Groupe.objects(filiere__in=filieres_dept)
                seances_semaine = Seance.objects(groupe__in=groupes, date_seance__gte=semaine_debut, date_seance__lte=semaine_fin)
                presences_semaine = Presence.objects(seance__in=seances_semaine)
                total = presences_semaine.count()
                if total > 0:
                    presents_retards = presences_semaine.filter(statut__in=["present", "retard"]).count()
                    taux = round((presents_retards / total) * 100, 1)
                else:
                    taux = 0
                row[dept.nom[:4].upper()] = taux
            weekly_attendance.append(row)

        return Response({
            "kpis": {
                "total_etudiants": total_etudiants,
                "taux_global": taux_global,
                "total_absences": total_absences,
                "total_alertes": total_alertes,
                "eliminations_semestre": eliminations_semestre
            },
            "monthly_trend": monthly_data,
            "filieres": filieres_data,
            "absences_by_type": absences_by_type,
            "justificatifs": justif_status,
            "radar_data": radar_data,
            "students_at_risk": at_risk,
            "weekly_attendance": weekly_attendance
        })    