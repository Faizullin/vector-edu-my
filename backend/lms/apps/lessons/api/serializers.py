from django.contrib.auth import get_user_model
from rest_framework import serializers

from api_lessons.models import Lesson, LessonPage, LessonBatch

User = get_user_model()


class LessonBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonBatch
        fields = ("id", "title",)


class LessonSerializer(serializers.ModelSerializer):
    lesson_batch = LessonBatchSerializer(read_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "is_available_on_free", "lesson_batch", "title", "description", "order"]


class LessonPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPage
        fields = ["id", "lesson", "order", ]


class LessonPageSerializerSubmitSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = LessonPage
        fields = ["id", "order"]


class LessonPageBulkUpdateSubmitSerializer(serializers.Serializer):
    lesson_id = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all())
    changes = LessonPageSerializerSubmitSerializer(many=True, write_only=True)
