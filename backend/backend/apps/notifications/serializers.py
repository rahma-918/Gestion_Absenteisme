# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Alerte, Notification
from apps.accounts.models import Etudiant, Utilisateur
from apps.academic.models import Matiere

class AlerteSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    type = serializers.ChoiceField(choices=['seuil_approche', 'seuil_depasse', 'elimination'])
    date_generation = serializers.DateTimeField(read_only=True)
    message = serializers.CharField(required=False, allow_blank=True)
    est_lue = serializers.BooleanField(default=False)
    etudiant = serializers.PrimaryKeyRelatedField(queryset=Etudiant.objects.all())
    matiere = serializers.PrimaryKeyRelatedField(queryset=Matiere.objects.all(), required=False, allow_null=True)

    def create(self, validated_data):
        return Alerte(**validated_data).save()

    def update(self, instance, validated_data):
        instance.est_lue = validated_data.get('est_lue', instance.est_lue)
        instance.message = validated_data.get('message', instance.message)
        instance.save()
        return instance


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    date_envoi = serializers.DateTimeField(read_only=True)
    type = serializers.ChoiceField(choices=['email', 'systeme', 'sms'])
    contenu = serializers.CharField()
    est_envoyee = serializers.BooleanField(default=False)
    destinataire = serializers.PrimaryKeyRelatedField(queryset=Utilisateur.objects.all())
    alerte = serializers.PrimaryKeyRelatedField(queryset=Alerte.objects.all(), required=False, allow_null=True)

    def create(self, validated_data):
        return Notification(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance