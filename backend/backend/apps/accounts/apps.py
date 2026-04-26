# Même contenu pour chaque app — exemple pour accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"   # ← SQLite par défaut
    name               = "apps.accounts"
    label              = "accounts"