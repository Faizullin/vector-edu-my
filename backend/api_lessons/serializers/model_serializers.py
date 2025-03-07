from rest_framework import serializers
from rest_framework.fields import SkipField

from api_lessons.models import *
from backend.global_function import UserContextNeededSerializer, NestedSupportedModelSerializer
from .components_serializers import LessonPageSerializer


class LessonMinimalDataSerializer(UserContextNeededSerializer, serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'is_available_on_free', 'completed', 'friends_count', 'title', 'description']

    def get_completed(self, obj):
        user_data = UserLessonModel.objects.filter(user=self.user, lesson=obj).first()
        if user_data:
            return user_data.completed
        return False

    def get_friends_count(self, obj: Lesson):
        counter = 0
        for i in self.user.friends.all():
            last_lesson = i.lessons.last()
            if last_lesson:
                if last_lesson.lesson == obj:
                    counter += 1
        return counter


class LessonBatchSerializer(UserContextNeededSerializer, serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = LessonBatch
        fields = '__all__'

    def get_lessons(self, obj):
        return LessonMinimalDataSerializer(obj.lessons.all(), user=self.user, many=True).data


class LessonSerializer(NestedSupportedModelSerializer, UserContextNeededSerializer):
    pages = LessonPageSerializer(many=True)
    review_mark = serializers.SerializerMethodField()
    review_comment = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_review_mark(self, obj: Lesson):
        user_lesson = UserLessonModel.objects.filter(user=self.user, lesson=obj).first()
        if user_lesson:
            return user_lesson.review_mark
        return None

    def get_review_comment(self, obj: Lesson):
        user_lesson = UserLessonModel.objects.filter(user=self.user, lesson=obj).first()
        if user_lesson:
            return user_lesson.review_comment
        return ''
