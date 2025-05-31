from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter

from . import views
from .api import views as api_views
from .lesson_page_editor.api import views as lesson_page_editor_api_views

router = DefaultRouter()
router.register(
    r"api/v1/lms/resources/posts", api_views.ResourcesPostViewSet, basename="post"
)
router.register(
    r"api/v1/lms/resources/categories",
    api_views.ResourcesCategoryViewSet,
    basename="category",
)

components_router = DefaultRouter()
components_router.register(r'api/v1/lms/resources/posts', api_views.ResourcesPostViewSet, basename='post')
components_router.register(r'api/v1/lms/resources/categories', api_views.ResourcesCategoryViewSet, basename='category')
components_router.register(r'api/v1/lms/resources/component/text-pro', lesson_page_editor_api_views.ResourcesTextComponentViewSet,
                           basename='text-pro-component')
components_router.register(r'api/v1/lms/resources/component/question', lesson_page_editor_api_views.ResourcesQuestionComponentViewSet,
                           basename='question-component')
components_router.register(r'api/v1/lms/resources/component/bluecard', lesson_page_editor_api_views.ResourcesBlueCardComponentViewSet,
                           basename='bluecard-component')
components_router.register(r'api/v1/lms/resources/component/audio', lesson_page_editor_api_views.ResourcesAudioComponentViewSet,
                           basename='audio-component')
components_router.register(r'api/v1/lms/resources/component/fill-text', lesson_page_editor_api_views.ResourceFillTextComponentViewSet,
                           basename='fill-text-component')
components_router.register(r'api/v1/lms/resources/component/video', lesson_page_editor_api_views.ResourcesVideoComponentViewSet,
                           basename='video-component')
components_router.register(r'api/v1/lms/resources/component/record-audio',
                           lesson_page_editor_api_views.ResourcesRecordAudioComponentViewSet, basename='record-audio-component')
components_router.register(r'api/v1/lms/resources/component/order', lesson_page_editor_api_views.ResourcesOrderComponentViewSet,
                           basename='order-component')
components_router.register(r'api/v1/lms/resources/component/image', lesson_page_editor_api_views.ResourcesImageComponentViewSet,
                           basename="image-component")
components_router.register(r'api/v1/lms/resources/component/matching', lesson_page_editor_api_views.MatchingComponentViewSet,
                           basename="matching-component")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(components_router.urls)),
    path(
        "api/v1/lms/resources/posts/edit-content/lessons2/action/",
        lesson_page_editor_api_views.ResourcesPostEditContentActionAPIView.as_view(),
        name="resources-post-edit-content-action-api",
    ),
    re_path(
        r"api/v1/lms/resources/protected-media/(?P<path>.*)$",
        views.ProtectedMediaLoadView.as_view(),
    ),
]
