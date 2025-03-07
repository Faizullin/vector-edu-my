from rest_framework import serializers
from .models import *


class DCQuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DCQuestionAnswer
        fields = "__all__"


class DCQuestionSerializer(serializers.ModelSerializer):
    answers = DCQuestionAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = DCQuestion
        fields = "__all__"


class GetDCAnswerByIdSerializer(serializers.Serializer):
    answer_id = serializers.IntegerField()

    def validate_answer_id(self, value):
        try:
            a = DCQuestionAnswer.objects.get(id=value)
        except DCQuestionAnswer.DoesNotExist:
            raise serializers.ValidationError('Answer not found')
        return a