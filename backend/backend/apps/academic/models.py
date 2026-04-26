# apps/academic/models.py
import mongoengine as me


class Departement(me.Document):
    nom = me.StringField(max_length=100, unique=True, required=True)

    meta = {
        "collection": "departements",
        "indexes": ["nom"],
        "ordering": ["nom"],
    }

    def __str__(self):
        return self.nom


class Filiere(me.Document):
    nom         = me.StringField(max_length=100, required=True)
    code        = me.StringField(max_length=20, unique=True, required=True)
    departement = me.ReferenceField(Departement, required=True)

    meta = {
        "collection": "filieres",
        "indexes": ["code"],
        "ordering": ["code"],
    }

    def __str__(self):
        return f"{self.code} — {self.nom}"


class Groupe(me.Document):
    num_groupe = me.IntField(required=True)
    filiere    = me.ReferenceField(Filiere, required=True)

    meta = {
        "collection": "groupes",
        "indexes": [{"fields": ["filiere", "num_groupe"], "unique": True}],
    }

    def __str__(self):
        return f"Groupe {self.num_groupe} — {self.filiere.code}"


class Matiere(me.Document):
    nom            = me.StringField(max_length=150, required=True)
    code           = me.StringField(max_length=20, unique=True, required=True)
    volume_horaire = me.IntField(required=True)
    seuil_absence  = me.IntField(default=3)
    filiere        = me.ReferenceField(Filiere, required=True)

    meta = {
        "collection": "matieres",
        "indexes": ["code"],
    }

    def __str__(self):
        return f"{self.code} — {self.nom}"


class Seance(me.Document):

    TYPES = ("cours", "td", "tp")

    date_seance    = me.DateField(required=True)
    heure_debut    = me.StringField(max_length=5, required=True)   # "HH:MM"
    heure_fin      = me.StringField(max_length=5, required=True)
    type_seance    = me.StringField(choices=TYPES, default="cours")
    matiere        = me.ReferenceField(Matiere, required=True)
    groupe         = me.ReferenceField(Groupe, required=True)
    enseignant     = me.ReferenceField("accounts.Enseignant", null=True)
    appel_effectue = me.BooleanField(default=False)

    meta = {
        "collection": "seances",
        "ordering": ["-date_seance"],
    }

    def __str__(self):
        return f"{self.matiere.code} — {self.type_seance} | {self.date_seance}"