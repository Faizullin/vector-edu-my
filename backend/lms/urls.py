from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from . import views

app_name = "lms"

urlpatterns = [
    path('lms', views.IndexView.as_view(), name='index'),
    path("", include("lms.apps.resources.urls")),
    path("", include("lms.apps.attachments.urls")),
    path("", include("lms.apps.lessons.urls")),
    path("", include("lms.apps.quizzes.urls")),
    path("", include("lms.apps.share_access.urls")),
    path("lms/login/", views.LoginView.as_view(), name="login"),
    path(
        "lms/logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout"
    ),
]