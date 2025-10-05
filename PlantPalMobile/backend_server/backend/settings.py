import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# ==========================================================
# Paths
# ==========================================================
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ==========================================================
# Security
# ==========================================================
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-key")
DEBUG = os.getenv("DEBUG", "True") == "True"

# ⚠ For development we allow all hosts. In production, list your domain/IP.
ALLOWED_HOSTS = ["*"]

# ==========================================================
# Installed Apps
# ==========================================================
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",  # JWT support

    # Local apps
    "api",
]

# ==========================================================
# Middleware
# ==========================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be near top
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ==========================================================
# URLs & WSGI
# ==========================================================
ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"

# ==========================================================
# Templates (needed for admin)
# ==========================================================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ==========================================================
# Database
# (SQLite for now – replace with Postgres or Supabase when ready)
# ==========================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ==========================================================
# Static files
# ==========================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"

# ==========================================================
# Default primary key
# ==========================================================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==========================================================
# CORS
# ==========================================================
# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True
# Or for more control:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:19006",   # Example Expo web address
#     "http://192.168.63.47:19006",
# ]

# ==========================================================
# Django REST Framework + JWT Authentication
# ==========================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",  # change to IsAuthenticated for production
    ),
}

# ==========================================================
# JWT Settings
# ==========================================================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),  # short expiry for access token
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),     # refresh token lasts longer
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
