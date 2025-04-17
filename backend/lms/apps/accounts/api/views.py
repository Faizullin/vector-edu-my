from django.contrib.auth import get_user_model
from django_filters import CharFilter
from django_filters.rest_framework import FilterSet
from rest_framework.permissions import IsAdminUser

from lms.apps.core.utils.crud_base.views import BaseViewSet
from .serializers import UserSerializer

User = get_user_model()


class UserViewSet(BaseViewSet):
    search_fields = ['username', "email"]
    ordering_fields = ['id', ]

    class UserFilter(FilterSet):
        username = CharFilter(lookup_expr='icontains')

        class Meta:
            model = User
            fields = ['id', 'username', "email"]

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
