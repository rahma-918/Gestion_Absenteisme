# apps/academic/serializers.py
from rest_framework import serializers
from .models import Departement, Filiere, Groupe, Matiere, Seance
from apps.accounts.models import Enseignant

class DepartementSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nom = serializers.CharField(max_length=100)

    def create(self, validated_data):
        return Departement(**validated_data).save()

    def update(self, instance, validated_data):
        instance.nom = validated_data.get('nom', instance.nom)
        instance.save()
        return instance


class FiliereSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nom = serializers.CharField(max_length=100)
    code = serializers.CharField(max_length=20)
    departement = serializers.PrimaryKeyRelatedField(queryset=Departement.objects.all())

    def create(self, validated_data):
        return Filiere(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class GroupeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    num_groupe = serializers.IntegerField()
    filiere = serializers.PrimaryKeyRelatedField(queryset=Filiere.objects.all())

    def create(self, validated_data):
        return Groupe(**validated_data).save()

    def update(self, instance, validated_data):
        instance.num_groupe = validated_data.get('num_groupe', instance.num_groupe)
        instance.filiere = validated_data.get('filiere', instance.filiere)
        instance.save()
        return instance


class MatiereSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nom = serializers.CharField(max_length=150)
    code = serializers.CharField(max_length=20)
    volume_horaire = serializers.IntegerField()
    seuil_absence = serializers.IntegerField(default=3)
    filiere = serializers.PrimaryKeyRelatedField(queryset=Filiere.objects.all())

    def create(self, validated_data):
        return Matiere(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class SeanceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    date_seance = serializers.DateField()
    heure_debut = serializers.RegexField(regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', max_length=5)
    heure_fin = serializers.RegexField(regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', max_length=5)
    type_seance = serializers.ChoiceField(choices=['cours', 'td', 'tp'], default='cours')
    matiere = serializers.PrimaryKeyRelatedField(queryset=Matiere.objects.all())
    groupe = serializers.PrimaryKeyRelatedField(queryset=Groupe.objects.all())
    enseignant = serializers.PrimaryKeyRelatedField(queryset=Enseignant.objects.all(), required=False, allow_null=True)
    appel_effectue = serializers.BooleanField(default=False)

    def create(self, validated_data):
        return Seance(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance