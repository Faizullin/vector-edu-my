from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter

from . import views
from .api import views as api_views

router = DefaultRouter()
router.register(r'api/v1/lms/resources/posts', api_views.ResourcesPostViewSet, basename='post')
router.register(r'api/v1/lms/resources/categories', api_views.ResourcesCategoryViewSet, basename='category')
router.register(r'api/v1/lms/resources/component/text', api_views.ResourcesTextComponentViewSet, basename='text-component')
router.register(r'api/v1/lms/resources/component/question', api_views.ResourcesQuestionComponentViewSet,
                basename='question-component')
router.register(r'api/v1/lms/resources/component/bluecard', api_views.ResourcesBlueCardComponentViewSet,
                basename='blue-card-component')
router.register(r'api/v1/lms/resources/component/audio', api_views.ResourcesAudioComponentViewSet,
                basename='audio-component')
router.register(r'api/v1/lms/resources/component/fill-text', api_views.ResourceFillTextComponentViewSet,
                basename='fill-text-component')
router.register(r'api/v1/lms/resources/component/video', api_views.ResourcesVideoComponentViewSet, basename='video-component')
router.register(r'api/v1/lms/resources/component/record-audio', api_views.ResourcesRecordAudioComponentViewSet, basename='record-audio-component')
router.register(r'api/v1/lms/resources/component/order', api_views.ResourcesOrderComponentViewSet, basename='order-component')
router.register(r'api/v1/lms/resources/component/image', api_views.ResourcesImageComponentViewSet, basename="image-component")
router.register(r'api/v1/lms/resources/component/matching', api_views.ResourcesMatchingComponentViewSet, basename="matching-component")


from .lesson_page_editor.api import views as lesson_page_editor_api_views
urlpatterns = [
    path('', include(router.urls)),
#     path("api/v1/lms/resources/posts/edit-content/action",
#          api_views.ResourcesPostEditContentActionAPIView.as_view(),
#          name="resources-post-edit-content-action-api"),
    path("api/v1/lms/resources/posts/edit-content/lessons2/action",
         lesson_page_editor_api_views.ResourcesPostEditContentActionAPIView.as_view(),
         name="resources-post-edit-content-action-api"),
    re_path(r"api/v1/lms/resources/protected-media/(?P<path>.*)$", views.ProtectedMediaLoadView.as_view())
]
