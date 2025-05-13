from django.contrib.auth import get_user_model
from api_lessons.models.lesson import Lesson
from api_users.models import UserTypes
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
from rest_framework.decorators import action

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
            fields = ["id", "username", "email", "user_type"]

    filterset_class = UserFilter

    def get_queryset(self):
        queryset = User.objects.all()
        return queryset

    def get_serializer_class(self):
        return UserSerializer

    # action for ahcnge bulk user type
    @action(detail=False, methods=["post"], url_path="toggle-user-type")
    def toggle_user_type(self, request):
        user_ids = request.data.get("user_ids", [])
        user_type = request.data.get("user_type", None)
        types_list = [i[0] for i in UserTypes.choices()]
        if not user_ids or not user_type:
            return Response(
                {"error": "user_ids and user_type are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user_type not in types_list:
            return Response(
                {"error": "user_type must be one of the following: " + str(types_list)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(user_ids, list):
            return Response(
                {"error": "user_ids must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not all(isinstance(user_id, int) for user_id in user_ids):
            return Response(
                {"error": "user_ids must be a list of integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # add logic to ehck all exitnace of user ids
        # and if user is not blocked
        try:
            not_existant_user_ids = []
            for id in user_ids:
                if not User.objects.filter(id=id).exists():
                    not_existant_user_ids.append(id)
            if not_existant_user_ids:
                return Response(
                    {
                        "error": "user_ids not exist",
                        "not_existant_user_ids": not_existant_user_ids,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            users = User.objects.filter(id__in=user_ids).update(user_type=user_type)
        except Exception as e:
            return Response(
                {"error": "Error while updating user_type", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"status": "success"})

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
