# apps/accounts/models.py
import mongoengine as me
from django.contrib.auth.hashers import make_password, check_password


class Utilisateur(me.Document):
    """Classe de base pour tous les utilisateurs."""

    ROLES = ("etudiant", "enseignant", "admin")

    nom       = me.StringField(max_length=100, required=True)
    prenom    = me.StringField(max_length=100, required=True)
    email     = me.EmailField(unique=True, required=True)
    cin       = me.StringField(max_length=20, unique=True, required=True)
    tel       = me.StringField(max_length=20, default="")
    role      = me.StringField(choices=ROLES, required=True)
    mdp       = me.StringField(required=True)      # stocké hashé
    is_active = me.BooleanField(default=True)
    date_joined = me.DateTimeField()

    meta = {
        "collection": "utilisateurs",
        "indexes": ["email", "cin"],
    }

    def set_password(self, raw_password):
        self.mdp = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.mdp)

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"
    
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.nom_complet} ({self.role})"


class Enseignant(me.Document):
    utilisateur = me.ReferenceField(Utilisateur, required=True)
    specialite  = me.StringField(max_length=100, default="")

    meta = {"collection": "enseignants"}

    def __str__(self):
        return f"Enseignant : {self.utilisateur.nom_complet}"


class Etudiant(me.Document):
    utilisateur     = me.ReferenceField(Utilisateur, required=True)
    num_inscription = me.StringField(max_length=20, unique=True, required=True)
    groupe          = me.ReferenceField("academic.Groupe", null=True)

    meta = {
        "collection": "etudiants",
        "indexes": ["num_inscription"],
    }

    def __str__(self):
        return f"Étudiant : {self.utilisateur.nom_complet} ({self.num_inscription})"


class AgentAdministratif(me.Document):
    utilisateur = me.ReferenceField(Utilisateur, required=True)
    poste       = me.StringField(max_length=100, default="")

    meta = {"collection": "agents_administratifs"}

    def __str__(self):
        return f"Agent : {self.utilisateur.nom_complet}"