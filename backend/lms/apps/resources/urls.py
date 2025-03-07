from django.urls import path
from . import views
from .api import views as api_views


urlpatterns = [
    path("lms/resources/posts", views.ResourcesPostListView.as_view(), name="resources-post-list"),
    path("api/v1/lms/resources/posts", api_views.ResourcesPostListAPIView.as_view(),
            name="resources-post-list-api"),
    path(
        "lms/resources/posts/add",
        views.ResourcesPostCreateView.as_view(),
        name="resources-post-create",
    ),
    path(
        "lms/resources/posts/<int:pk>/edit",
        views.ResourcesPostUpdateView.as_view(),
        name="resources-post-update",
    ),
    path(
        "lms/resources/posts/<int:pk>/edit-content",
        views.ResourcesPostEditContentView.as_view(),
        name="resources-post-edit-content",
    ),
    path("api/v1/lms/resources/posts/edit-content/action",
            api_views.ResourcesPostEditContentActionAPIView.as_view(),
            name="resources-post-edit-content-action-api"),
    path(
        "lms/resources/posts/<int:pk>",
        views.ResourcesPostDeleteView.as_view(),
        name="resources-post-delete",
    ),
]