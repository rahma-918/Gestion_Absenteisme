# apps/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Utilisateur, Enseignant, Etudiant, AgentAdministratif
from apps.academic.models import Groupe  # pour la référence
import datetime


class UtilisateurSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    cin = serializers.CharField(max_length=20)
    tel = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['etudiant', 'enseignant', 'admin'])
    mdp = serializers.CharField(write_only=True, required=True)
    is_active = serializers.BooleanField(default=True)
    date_joined = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        password = validated_data.pop('mdp')
        validated_data['mdp'] = make_password(password)
        return Utilisateur(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'mdp':
                setattr(instance, attr, make_password(value))
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance


class EnseignantSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    utilisateur = serializers.PrimaryKeyRelatedField(queryset=Utilisateur.objects.all())
    specialite = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        return Enseignant(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class EtudiantSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    utilisateur = serializers.PrimaryKeyRelatedField(queryset=Utilisateur.objects.all())
    num_inscription = serializers.CharField(max_length=20)
    groupe = serializers.PrimaryKeyRelatedField(queryset=Groupe.objects.all(), required=False, allow_null=True)

    def create(self, validated_data):
        return Etudiant(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class AgentAdministratifSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    utilisateur = serializers.PrimaryKeyRelatedField(queryset=Utilisateur.objects.all())
    poste = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        return AgentAdministratif(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ----- Sérializers pour l'authentification JWT -----

class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    cin = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['etudiant', 'enseignant', 'admin'])
    studentId = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if Utilisateur.objects.filter(email=value).first():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    def validate_cin(self, value):
        if Utilisateur.objects.filter(cin=value).first():
            raise serializers.ValidationError("Ce CIN est déjà utilisé.")
        return value

    def create(self, validated_data):
        # Découper le nom complet
        full_name = validated_data['name'].strip()
        name_parts = full_name.split(' ', 1)
        prenom = name_parts[0]
        nom = name_parts[1] if len(name_parts) > 1 else ''

        email = validated_data['email']
        password = validated_data['password']
        role = validated_data['role']
        student_id = validated_data.get('studentId', '')

        # Création de l'utilisateur
        user = Utilisateur(
            nom=nom,
            prenom=prenom,
            email=validated_data['email'],
            cin=validated_data['cin'],          # à compléter plus tard
            tel='',
            role=role,
            is_active=True,
            date_joined=datetime.datetime.utcnow()
        )
        user.set_password(password)
        user.save()

        # Création du profil spécifique
        if role == 'etudiant':
            Etudiant.objects.create(
                utilisateur=user,
                num_inscription=student_id,
                groupe=None
            )
        elif role == 'enseignant':
            Enseignant.objects.create(
                utilisateur=user,
                specialite=''
            )
        elif role == 'admin':
            AgentAdministratif.objects.create(
                utilisateur=user,
                poste=''
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        try:
            user = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")

        if not user.check_password(password):
            raise serializers.ValidationError("Email ou mot de passe incorrect.")

        if not user.is_active:
            raise serializers.ValidationError("Ce compte est désactivé.")

        data['user'] = user
        return data