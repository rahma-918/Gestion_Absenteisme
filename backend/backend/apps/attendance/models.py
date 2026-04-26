# apps/attendance/models.py
import mongoengine as me
from datetime import datetime


class Presence(me.Document):

    STATUTS = ("present", "absent", "retard")

    statut              = me.StringField(choices=STATUTS, default="present")
    date_enregistrement = me.DateTimeField(default=datetime.utcnow)
    seance              = me.ReferenceField("academic.Seance", required=True)
    etudiant            = me.ReferenceField("accounts.Etudiant", required=True)

    meta = {
        "collection": "presences",
        "indexes": [
            {"fields": ["seance", "etudiant"], "unique": True},
        ],
        "ordering": ["-date_enregistrement"],
    }

    def modifier_presence(self, nouveau_statut):
        self.statut = nouveau_statut
        self.save()

    def __str__(self):
        return f"{self.etudiant} — {self.statut}"


class Justificatif(me.Document):

    STATUTS = ("en_attente", "valide", "refuse")

    date_depot      = me.DateField(default=datetime.utcnow)
    fichier         = me.StringField(max_length=500, default="")
    statut          = me.StringField(choices=STATUTS, default="en_attente")
    commentaire     = me.StringField(default="")
    presence        = me.ReferenceField(Presence, null=True)
    etudiant        = me.ReferenceField("accounts.Etudiant", required=True)
    valide_par      = me.ReferenceField("accounts.Enseignant", null=True)
    date_traitement = me.DateTimeField(null=True)

    meta = {
        "collection": "justificatifs",
        "ordering": ["-date_depot"],
    }

    def valider(self, enseignant, commentaire=""):
        self.statut          = "valide"
        self.valide_par      = enseignant
        self.commentaire     = commentaire
        self.date_traitement = datetime.utcnow()
        self.save()

    def refuser(self, enseignant, commentaire=""):
        self.statut          = "refuse"
        self.valide_par      = enseignant
        self.commentaire     = commentaire
        self.date_traitement = datetime.utcnow()
        self.save()

    def __str__(self):
        return f"Justificatif de {self.etudiant} — {self.statut}"


class Elimination(me.Document):

    STATUTS = ("en_cours", "confirmee", "annulee")

    date_elimination = me.DateField(default=datetime.utcnow)
    motif            = me.StringField(default="")
    statut           = me.StringField(choices=STATUTS, default="en_cours")
    etudiant         = me.ReferenceField("accounts.Etudiant", required=True)
    matiere          = me.ReferenceField("academic.Matiere", required=True)
    gere_par         = me.ReferenceField("accounts.AgentAdministratif", null=True)

    meta = {
        "collection": "eliminations",
        "ordering": ["-date_elimination"],
    }

    def marquer_elimine(self, agent, motif=""):
        self.statut   = "confirmee"
        self.motif    = motif
        self.gere_par = agent
        self.save()

    def annuler(self):
        self.statut = "annulee"
        self.save()

    def __str__(self):
        return f"Élimination : {self.etudiant} — {self.matiere}"