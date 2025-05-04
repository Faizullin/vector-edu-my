from django.contrib import admin
from django.urls import include, path, re_path
from django.contrib.auth import views as auth_views
from . import views

app_name = "lms"

urlpatterns = [
    re_path(r"^lms(?:/.*)?$", views.IndexView.as_view(), name="index"),
    path("api/v1/lms/settings", views.SettingsAPIView.as_view(), name="settings-api"),
    path("", include("lms.apps.resources.urls")),
    path("", include("lms.apps.attachments.urls")),
    path("", include("lms.apps.lessons.urls")),
    path("", include("lms.apps.quizzes.urls")),
    path("", include("lms.apps.share_access.urls")),
    path("", include("lms.apps.accounts.urls")),
    path("lms/auth/login/", views.LoginView.as_view(), name="login"),
    path(
        "lms/auth/logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout"
    ),
]
