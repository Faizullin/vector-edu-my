from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import views as api_views
from .editor_v3.urls import urlpatterns as editor_v3_urls

router = DefaultRouter()
router.register(
    r"api/v1/lms/lessons/lessons", api_views.LessonsLessonViewSet, basename="lesson"
)
router.register(
    r"api/v1/lms/lessons/batches", api_views.LessonsBatchViewSet, basename="batch"
)
router.register(
    r"api/v1/lms/lessons/pages", api_views.LessonsPageViewSet, basename="page"
)

urlpatterns = [
    path("", include(router.urls)),
] + editor_v3_urls
