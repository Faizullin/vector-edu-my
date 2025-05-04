from django.contrib.auth import get_user_model, authenticate
from api_lessons.models.lesson import Lesson
from rest_framework import serializers

UserModel = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = [
            "id",
            "username",
            "email",
            "date_joined",
            "is_active",
            "is_staff",
            "is_superuser",
        ]


class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "email", "username", "first_name", "last_name", "is_staff")


class LoginSerializer(serializers.Serializer):
    # email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)

    def validate(self, attrs):
        user = authenticate(
            self.context["request"],
            username=attrs["username"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials", code="auth")
        if not user.is_active:
            raise serializers.ValidationError("User inactive", code="auth")
        attrs["user"] = user
        return attrs


class LessonUserPermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["__all__"]
