from rest_framework import serializers

from api_lessons.models import get_video_link_from_vimeo
from .models import *

from backend.global_function import NestedSupportedModelSerializer, ModelIntegerField


class AdditionalAudioComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = AdditionalAudioComponent
        fields = '__all__'


class AdditionalVideoComponentSerializer(NestedSupportedModelSerializer):
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = AdditionalVideoComponent
        fields = '__all__'

    def get_video_url(self, obj):
        return get_video_link_from_vimeo(obj.video_url)


class AdditionalImageComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = AdditionalImageComponent
        fields = '__all__'


class AdditionalTextComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = AdditionalTextComponent
        fields = '__all__'


class AdditionalLessonElementSerializer(NestedSupportedModelSerializer):
    audio_component = AdditionalAudioComponentSerializer(many=False, allow_null=True, required=False)
    video_component = AdditionalVideoComponentSerializer(many=False, allow_null=True, required=False)
    text_component = AdditionalTextComponentSerializer(many=False, allow_null=True, required=False)
    image_component = AdditionalImageComponentSerializer(many=False, allow_null=True, required=False)

    lesson = ModelIntegerField(source='lesson.id', model=AdditionalLesson)

    class Meta:
        model = AdditionalLessonElement
        fields = '__all__'


class AdditionalLessonSerializer(NestedSupportedModelSerializer):
    elements = AdditionalLessonElementSerializer(many=True)

    lesson_batch = ModelIntegerField(source='lesson_batch.id', model=AdditionalLessonBatch)

    class Meta:
        model = AdditionalLesson
        exclude = ['timestamp']


class AdditionalLessonBatchSerializer(NestedSupportedModelSerializer):
    lessons = AdditionalLessonSerializer(many=True)

    class Meta:
        model = AdditionalLessonBatch
        exclude = ['timestamp']


# ------------ Serializers that wont serialize components ---------

class AdditionalLessonsWithoutComponentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalLesson
        exclude = ['timestamp', 'lesson_batch']


class AdditionalLessonBatchWithoutComponentsSerializer(serializers.ModelSerializer):
    lessons = AdditionalLessonsWithoutComponentsSerializer(many=True)

    class Meta:
        model = AdditionalLessonBatch
        exclude = ['timestamp']
