from django.contrib.auth import get_user_model
from api_lessons.models.lesson import Lesson
from django_filters import CharFilter
from django_filters.rest_framework import FilterSet
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import login, logout
from rest_framework import generics, permissions, status

from lms.apps.core.utils.crud_base.views import BaseViewSet
from .serializers import (
    LessonUserPermSerializer,
    UserSerializer,
    LoginSerializer,
    UserMeSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication

User = get_user_model()


class UserViewSet(BaseViewSet):
    search_fields = ["username", "email"]
    ordering_fields = [
        "id",
    ]

    class UserFilter(FilterSet):
        username = CharFilter(lookup_expr="icontains")

        class Meta:
            model = User
            fields = ["id", "username", "email"]

    filterset_class = UserFilter

    def get_queryset(self):
        queryset = User.objects.all()
        return queryset

    def get_serializer_class(self):
        return UserSerializer

    # def get_permissions(self):
    #     default_perms = super().get_permissions()
    #     if self.action in ['list', 'retrieve']:
    #         self.permission_classes = default_perms
    #     else:
    #         self.permission_classes = default_perms + [IsAdminUser]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        user = ser.validated_data["user"]
        login(request, user)  # sets the session cookie
        return Response(UserMeSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [
        SessionAuthentication,
    ]

    def post(self, request):
        logout(request)  # clears session
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [
        SessionAuthentication,
    ]

    def get(self, request):
        user = request.user
        serializer = UserMeSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserMeSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# class LessonUserPermissionsView(BaseViewSet):

#     class LessonUserFilter(FilterSet):
#         # user_id = NumberFilter(field_name="lesson", lookup_expr="exact")
#         title = CharFilter(lookup_expr='icontains')

#         class Meta:
#             model = Lesson
#             fields = ["id", "title", "user"]

#     filterset_class = LessonUserFilter

#     # def get_queryset(self):
#     #     queryset = Lesson.objects.all()
#     #     return queryset

#     def get_serializer_class(self):
#         return LessonUserPermSerializer

#     def get_queryset(self):
#         queryset = Lesson.objects.all()
#         # get user from request user_id as required key
#         # impement logic to get all lessons where is_available_on_free = True or user.is_paid() = True

#         queryset = queryset.filter(
#             user=self.request.user, is_available_on_free=True
#         ) | queryset.filter(user=self.request.user, user__is_paid=True)
#         return queryset
