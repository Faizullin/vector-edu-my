from django.urls import path, include
from rest_framework.routers import DefaultRouter


from .api import views as api_views

router = DefaultRouter()
router.register(
    r"api/v1/lms/reports",
    api_views.ReportViewSet,
    basename="report",
)

urlpatterns = [
    path("", include(router.urls)),
]
