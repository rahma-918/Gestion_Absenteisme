# apps/attendance/serializers.py
from rest_framework import serializers
from .models import Presence, Justificatif, Elimination
from apps.academic.models import Seance, Matiere
from apps.accounts.models import Etudiant, Enseignant, AgentAdministratif

class PresenceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    statut = serializers.ChoiceField(choices=['present', 'absent', 'retard'], default='present')
    date_enregistrement = serializers.DateTimeField(read_only=True)
    seance = serializers.PrimaryKeyRelatedField(queryset=Seance.objects.all())
    etudiant = serializers.PrimaryKeyRelatedField(queryset=Etudiant.objects.all())

    def create(self, validated_data):
        return Presence(**validated_data).save()

    def update(self, instance, validated_data):
        if 'statut' in validated_data:
            instance.modifier_presence(validated_data['statut'])
        # autres champs non modifiables volontairement
        return instance


class JustificatifSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    date_depot = serializers.DateField(read_only=True)
    fichier = serializers.CharField(max_length=500, required=False, allow_blank=True)
    statut = serializers.ChoiceField(choices=['en_attente', 'valide', 'refuse'], read_only=True)
    commentaire = serializers.CharField(required=False, allow_blank=True)
    presence = serializers.PrimaryKeyRelatedField(queryset=Presence.objects.all(), required=False, allow_null=True)
    etudiant = serializers.PrimaryKeyRelatedField(queryset=Etudiant.objects.all())
    valide_par = serializers.PrimaryKeyRelatedField(queryset=Enseignant.objects.all(), required=False, allow_null=True)
    date_traitement = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Justificatif(**validated_data).save()

    def update(self, instance, validated_data):
        # Seuls les champs modifiables via une validation
        if 'commentaire' in validated_data:
            instance.commentaire = validated_data['commentaire']
        # Modification de statut via les méthodes valider/refuser
        instance.save()
        return instance


class EliminationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    date_elimination = serializers.DateField(read_only=True)
    motif = serializers.CharField(required=False, allow_blank=True)
    statut = serializers.ChoiceField(choices=['en_cours', 'confirmee', 'annulee'], read_only=True)
    etudiant = serializers.PrimaryKeyRelatedField(queryset=Etudiant.objects.all())
    matiere = serializers.PrimaryKeyRelatedField(queryset=Matiere.objects.all())
    gere_par = serializers.PrimaryKeyRelatedField(queryset=AgentAdministratif.objects.all(), required=False, allow_null=True)

    def create(self, validated_data):
        return Elimination(**validated_data).save()

    def update(self, instance, validated_data):
        if 'motif' in validated_data:
            instance.motif = validated_data['motif']
        # Les changements de statut doivent utiliser marquer_elimine / annuler
        instance.save()
        return instance