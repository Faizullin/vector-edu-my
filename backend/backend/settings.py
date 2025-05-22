import os
from pathlib import Path

import firebase_admin
from django.utils import timezone
from firebase_admin import credentials

RUNNING_FROM_DOCKER = os.environ.get('RUNNING_FROM_DOCKER', False)
BASE_DIR = Path(__file__).resolve().parent.parent

# Default User
AUTH_USER_MODEL = 'api_users.UserModel'
USERNAME_FIELD = 'email'

SECRET_KEY = os.environ.get(
    "SECRET_KEY", default="django-insecure-3b!7h8__f5e2frki-d&*)gb5y@--&*e&#oh=41y)cq%jwh$g5c")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.environ.get("DEBUG", default=1))
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", "*").split(" ")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "http://localhost").split(" ")
# Application definition

INSTALLED_APPS = [
    "daphne",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'protected_media.apps.ProtectedMediaConfig',
    'corsheaders',
    'django_q',
    'rest_framework.authtoken',
    'api_lessons',
    'api_users',
    'api_data_collection',
    'api_global_event',
    'api_additional_materials',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = "backend.asgi.application"

AUTH_TOKEN_VALIDITY = timezone.timedelta(days=1)

REST_FRAMEWORK = {
    'NON_FIELD_ERRORS_KEY': 'errors',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        "rest_framework.authentication.TokenAuthentication",
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'api_users.permissions.IsAuthenticatedWithBlocked',
    ],
    'EXCEPTION_HANDLER': 'backend.global_function.custom_exception_handler',
}

# Firebase
cred = credentials.Certificate("service_account.json")
firebase_admin.initialize_app(cred)
print("Firebase admin is initialized")

# Database

if RUNNING_FROM_DOCKER:
    print("USING POSTGRESQL DATABASE")
    DATABASES = {
        "default": {
            "ENGINE": 'django.db.backends.postgresql',
            "NAME": os.environ.get("POSTGRES_DB"),
            "USER": os.environ.get("POSTGRES_USER"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
            "HOST": os.environ.get("POSTGRES_HOST"),
            "PORT": os.environ.get("POSTGRES_PORT"),
        }
    }

else:
    print("USING SQLITE DATABASE")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'ru'

TIME_ZONE = 'Asia/Almaty'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = (
    BASE_DIR / 'static/',
)

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

# Logging
LOGGING = {}

if RUNNING_FROM_DOCKER:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            },
            'simple': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'INFO' if DEBUG else 'ERROR',
                'class': 'logging.FileHandler',
                'filename': './logs.log',
                'formatter': 'verbose'
            },
        },
        'loggers': {
            'django': {
                'handlers': ['file'],
                'level': 'INFO' if DEBUG else 'ERROR',
                'propagate': True,
            },
        },
    }

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

Q_CLUSTER = {
    'name': 'backend',
    'workers': 3,
    'recycle': 500,
    'timeout': 60,
    'compress': True,
    'save_limit': 250,
    'queue_limit': 500,
    'cpu_affinity': 1,
    'label': 'Django Q2',
    'orm': 'default',
    'ack_failures': True,
    'max_attempts': 1,
    'attempt_count': 1
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get('REDIS_HOST', "127.0.0.1"), os.environ.get('REDIS_PORT', '6379'))],
        },
    },
}

if RUNNING_FROM_DOCKER:
    PROTECTED_MEDIA_ROOT = "/home/app/protected/"
    PROTECTED_MEDIA_SERVER = "nginx"
else:
    PROTECTED_MEDIA_ROOT = "%s/protected/" % BASE_DIR
    PROTECTED_MEDIA_SERVER = "django"

PROTECTED_MEDIA_URL = "/protected"
PROTECTED_MEDIA_LOCATION_PREFIX = "/internal"  # Prefix used in nginx config
PROTECTED_MEDIA_AS_DOWNLOADS = False

# vimeo

VIMEO_ACCESS_TOKEN = os.environ.get("VIMEO_ACCESS_TOKEN", '')

DEBUG_MODE = bool(os.environ.get("DEBUG", default=1))
INSTALLED_APPS += [
    "lms",
    "lms.apps.core",
    "lms.apps.attachments",
    "lms.apps.posts",
    "lms.apps.resources",
    "lms.apps.reports",
]

if DEBUG_MODE:
    INSTALLED_APPS.append('debug_toolbar')
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ("127.0.0.1",)


    def show_toolbar(request):
        return True


    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_TOOLBAR_CALLBACK": show_toolbar,
        'RESULTS_CACHE_SIZE': 100,
        'SQL_WARNING_THRESHOLD': 2000
    }

    # allow frontend cors

    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
    ]
    CORS_ALLOW_CREDENTIALS = True

    del REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"]
