from django.urls import path

from .api import views as api_views

urlpatterns = [
    path(
        "api/v1/lms/lessons/editor_v3/action/",
        api_views.LessonPageEditPostActionAPIView.as_view(),
        name="lesson-page-edit-post-action-api",
    ),
]
