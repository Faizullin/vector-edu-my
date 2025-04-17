from django.contrib.auth import get_user_model
from rest_framework import serializers

from api_lessons.models import Lesson, LessonPage, LessonBatch

User = get_user_model()


class LessonBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonBatch
        fields = ("id", "title",)


class LessonSubmitSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)

    class Meta:
        model = Lesson
        fields = ["id", "is_available_on_free", "lesson_batch", "title", "description", "order"]


class LessonSerializer(serializers.ModelSerializer):
    lesson_batch = LessonBatchSerializer()

    class Meta:
        model = Lesson
        fields = ["id", "is_available_on_free", "lesson_batch", "title", "description", "order"]


class LessonPageSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)

    class Meta:
        model = LessonPage
        fields = ["id", "lesson", "order", ]


class LessonPageReorderSubmitSerializer(serializers.Serializer):
    lesson_id = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all())
    ordered_ids = serializers.ListField(child=serializers.IntegerField())
