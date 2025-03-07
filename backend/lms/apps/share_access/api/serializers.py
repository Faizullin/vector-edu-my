from rest_framework import serializers

from django.contrib.auth import get_user_model


UserModel = get_user_model()


class ShareAccessObjUsersListSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ["id", "username", "email", "permissions"]

    def get_permissions(self, user):
        obj = self.context.get("obj")
        if obj:
            return list(user.get_perms(obj))
        return []

class ShareAccessObjUsersUpdateSerializer(serializers.Serializer):
    users = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )