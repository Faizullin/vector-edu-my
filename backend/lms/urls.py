from django.urls import include, path, re_path
from . import views

app_name = "lms"

urlpatterns = [
    re_path(r"^lms(?:/.*)?$", views.IndexView.as_view(), name="index"),
    path("", include("lms.apps.resources.urls")),
    path("", include("lms.apps.attachments.urls")),
    path("", include("lms.apps.lessons.urls")),
    path("", include("lms.apps.accounts.urls")),
    path("", include("lms.apps.reports.urls")),
]
