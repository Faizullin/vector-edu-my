from django.urls import path
from django.utils.translation import gettext_lazy as _
from .api import views as api_views

urlpatterns = [
    path("api/v1/lms/share-access/obj-users/get-users", api_views.ShareAccessObjUsersListAPIView.as_view(),
            name="share-access-obj-users-list-api"),
    path("api/v1/lms/share-access/obj-users/update", api_views.ShareAccessObjUsersUpdateAPIView.as_view(),
            name="share-access-obj-users-update-api"),
]