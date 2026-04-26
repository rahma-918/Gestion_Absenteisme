# apps/notifications/models.py
import mongoengine as me
from datetime import datetime


class Alerte(me.Document):

    TYPES = ("seuil_approche", "seuil_depasse", "elimination")

    type            = me.StringField(choices=TYPES, required=True)
    date_generation = me.DateTimeField(default=datetime.utcnow)
    message         = me.StringField(default="")
    est_lue         = me.BooleanField(default=False)
    etudiant        = me.ReferenceField("accounts.Etudiant", required=True)
    matiere         = me.ReferenceField("academic.Matiere", null=True)

    meta = {
        "collection": "alertes",
        "ordering": ["-date_generation"],
    }

    def __str__(self):
        return f"Alerte {self.type} — {self.etudiant}"


class Notification(me.Document):

    TYPES = ("email", "systeme", "sms")

    date_envoi   = me.DateTimeField(default=datetime.utcnow)
    type         = me.StringField(choices=TYPES, required=True)
    contenu      = me.StringField(required=True)
    est_envoyee  = me.BooleanField(default=False)
    destinataire = me.ReferenceField("accounts.Utilisateur", required=True)
    alerte       = me.ReferenceField(Alerte, null=True)

    meta = {
        "collection": "notifications",
        "ordering": ["-date_envoi"],
    }

    def envoyer_email(self):
        from django.core.mail import send_mail
        send_mail(
            subject="GestionAbsence — Notification",
            message=self.contenu,
            from_email=None,
            recipient_list=[self.destinataire.email],
            fail_silently=True,
        )
        self.est_envoyee = True
        self.save()

    def __str__(self):
        return f"Notification ({self.type}) → {self.destinataire}"