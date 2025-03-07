from django.contrib.auth import get_user_model
from rest_framework import serializers

from api_lessons.models import FillTextLine, AudioComponent, UserRecordAudioComponent, RecordAudioComponent, \
    PutInOrderComponentElement, MatchingComponentElement, QuestionComponent, QuestionAnswer

User = get_user_model()


class FillTextLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = FillTextLine
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionComponent
        fields = "__all__"


class MultiAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = "__all__"


