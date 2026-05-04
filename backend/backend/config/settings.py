# config/settings.py

from pathlib import Path
from decouple import config
import mongoengine

BASE_DIR = Path(__file__).resolve().parent.parent

# ── SÉCURITÉ ──────────────────────────────────────────────────
SECRET_KEY    = config("SECRET_KEY")
DEBUG         = config("DEBUG", cast=bool, default=True)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1").split(",")

# ── APPLICATIONS ──────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # REST Framework
    "rest_framework",
    "corsheaders",

    # Vos apps
    "apps.accounts",
    "apps.academic",
    "apps.attendance",
    "apps.notifications",
    "apps.reports",
]

# ── MIDDLEWARE ─────────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",        # ← doit être en premier
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF      = "config.urls"
WSGI_APPLICATION  = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ── BASE DE DONNÉES ────────────────────────────────────────────
# Django a besoin d'une DB SQL minimale pour ses apps internes
# (sessions, admin, auth). On utilise SQLite juste pour ça.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ── CONNEXION MONGOENGINE ──────────────────────────────────────
MONGO_URI = config("MONGO_URI", default="mongodb://localhost:27017/gestion_absence_db")

mongoengine.connect(
    host=MONGO_URI,
    alias="default",
)

AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.MongoEngineAuthBackend',
    'django.contrib.auth.backends.ModelBackend',  # gardé pour l'admin SQL
]

# ── REST FRAMEWORK ─────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.accounts.authentication.MongoJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ── SIMPLE JWT ────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTHENTICATION_BACKEND': 'apps.accounts.backends.MongoEngineAuthBackend',
}
# ── CORS ───────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",    # React Vite
    "http://localhost:3000",
    "http://localhost:5174",
]

# ── INTERNATIONALISATION ───────────────────────────────────────
LANGUAGE_CODE  = "fr-fr"
TIME_ZONE      = "Africa/Tunis"
USE_I18N       = True
USE_TZ         = True

# ── FICHIERS STATIQUES & MEDIA ─────────────────────────────────
STATIC_URL   = "/static/"
STATIC_ROOT  = BASE_DIR / "staticfiles"
MEDIA_URL    = "/media/"
MEDIA_ROOT   = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'