# apps/accounts/backends.py
from django.contrib.auth.backends import BaseBackend
from .models import Utilisateur

class MongoEngineAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # username correspond à l'email
        try:
            user = Utilisateur.objects.get(email=username)
        except Utilisateur.DoesNotExist:
            return None
        if user.check_password(password) and user.is_active:
            return user
        return None

    def get_user(self, user_id):
        try:
            return Utilisateur.objects.get(id=user_id)
        except Utilisateur.DoesNotExist:
            return None