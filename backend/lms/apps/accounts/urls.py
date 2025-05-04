
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api import views as api_views

router = DefaultRouter()
router.register(r'api/v1/lms/accounts/users', api_views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path("api/v1/lms/auth/login/",      api_views.LoginView.as_view()),
    path("api/v1/lms/auth/logout/",     api_views.LogoutView.as_view()),
    path("api/v1/lms/auth/me/",     api_views.UserMeView.as_view()),
]
