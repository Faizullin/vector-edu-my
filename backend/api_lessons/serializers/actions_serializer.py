from rest_framework import serializers
from api_lessons.models import *
from api_lessons.serializers import GetLessonById


class AnswerToQuestionSerializer(serializers.Serializer):
    answer_id = serializers.IntegerField()

    def validate_answer_id(self, answer_id):
        try:
            answer = QuestionAnswer.objects.get(id=answer_id)
        except QuestionAnswer.DoesNotExist:
            raise serializers.ValidationError('Answer does not exist')
        return answer


class AnswerToFillTextSerializer(serializers.Serializer):
    class Temp(serializers.Serializer):
        line_id = serializers.IntegerField()
        answer = serializers.CharField(allow_blank=True)

        def validate_line_id(self, line_id):
            try:
                line = FillTextLine.objects.get(id=line_id)
            except FillTextLine.DoesNotExist:
                raise serializers.ValidationError('Line does not exist')
            return line

    lines = Temp(many=True)


class AnswerToMatchingComponentSerializer(serializers.Serializer):
    class Temp(serializers.Serializer):
        first_element_id = serializers.IntegerField()
        second_element_id = serializers.IntegerField()

        def validate_first_element_id(self, first_element_id):
            try:
                element = MatchingComponentElement.objects.get(id=first_element_id)
                if not hasattr(element, 'first_element'):
                    raise serializers.ValidationError('Element is not first element')
            except MatchingComponentElement.DoesNotExist:
                raise serializers.ValidationError('Element does not exist')
            return element

        def validate_second_element_id(self, second_element_id):
            try:
                element = MatchingComponentElement.objects.get(id=second_element_id)
                if not hasattr(element, 'second_element'):
                    raise serializers.ValidationError('Element is not second element')
            except MatchingComponentElement.DoesNotExist:
                raise serializers.ValidationError('Element does not exist')
            return element

    elements = Temp(many=True)


class AnswerToPutInOrderComponentSerializer(serializers.Serializer):
    class Temp(serializers.Serializer):
        element_id = serializers.IntegerField()
        order = serializers.IntegerField()

        def validate_element_id(self, element_id):
            try:
                element = PutInOrderComponentElement.objects.get(id=element_id)
            except PutInOrderComponentElement.DoesNotExist:
                raise serializers.ValidationError('Element does not exist')
            return element

        def validate_order(self, order):
            if order < 0:
                raise serializers.ValidationError('Order must be positive')
            return order

    elements = Temp(many=True)


class LeaveReviewOnLessonSerializer(GetLessonById):
    mark = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(allow_blank=True, max_length=4096)
