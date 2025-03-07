from rest_framework import serializers

from api_lessons.models import *


class GetLessonById(serializers.Serializer):
    lesson_id = serializers.IntegerField()

    def validate_lesson_id(self, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise serializers.ValidationError('Lesson does not exist')
        return lesson
