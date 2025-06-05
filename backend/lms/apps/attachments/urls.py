from django.urls import path

from .api import views as api_views

urlpatterns = [
#     path("api/v1/lms/attachments/", api_views.AttachmentListAPIView.as_view(), name="attachments-list-api"),
#     path("api/v1/lms/attachments/upload/", api_views.AttachmentUploadAPIView.as_view(),
#          name="attachments-upload-api"),
#     path("api/v1/lms/attachments/action/", api_views.AttachmentActionAPIView.as_view(),
#          name="attachments-action-api"),
]
