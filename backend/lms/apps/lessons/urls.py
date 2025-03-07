from django.urls import path

from . import views
from .api import views as api_views
from .url_reverses import url_reverses_dict

urlpatterns = [
    path("lms/lessons/dashboard", views.LessonPageListView.as_view(),
         name="lesson-dashboard"),
    path("lms/lessons", views.LessonListView.as_view(), name="lesson-list"),
    path("api/v1/lms/lessons", api_views.LessonListAPIView.as_view(),
         name="lesson-list-api"),
    path(
        "lms/lessons/add",
        views.LessonCreateView.as_view(),
        name="lesson-create",
    ),
    path(
        url_reverses_dict["lesson-update"],
        views.LessonUpdateView.as_view(),
        name="lesson-update",
    ),
    path("api/v1/lms/lessons/action/", api_views.LessonActionAPIView.as_view(),
         name="lesson-action-api"),
    path(url_reverses_dict["lesson-page-open-editor"],
         views.LessonPageOpenEditor.as_view(),
         name="lesson-page-open-editor",
         ),
    path(
        "lms/lessons/pages",
        views.LessonPageListView.as_view(),
        name="lesson-page-list",
    ),
    path(
        "lms/lessons/pages/add",
        views.LessonPageCreateView.as_view(),
        name="lesson-page-create",
    ),
    path(
        "api/v1/lms/lessons/pages",
        api_views.LessonPageListAPIView.as_view(),
        name="lesson-page-list-api",
    ),
    path(
        url_reverses_dict["lesson-page-update"],
        views.LessonPageUpdateView.as_view(),
        name="lesson-page-update",
    ),
    path(
        url_reverses_dict["lesson-id-page-action"],
        views.LessonNestedPageActionView.as_view(),
        name="lesson-id-page-action",
    )
]
