from django.shortcuts import render
from rest_framework.views import APIView

from backend.global_function import success_with_text
from .models import *
from api_users.models import UserModel
from .serializers import *


# Create your views here.
class GetDCQuestionsView(APIView):
    def get(self, request):
        user: UserModel = request.user
        answered_questions_ids = DCUserAnswer.objects.filter(user=user).values_list('answer__question', flat=True)
        non_answered_questions = DCQuestion.objects.filter().exclude(id__in=answered_questions_ids)
        if non_answered_questions.exclude(needs_answer=False).count() == 0:
            return success_with_text([])
        serializer = DCQuestionSerializer(non_answered_questions, many=True)
        return success_with_text(serializer.data)


class AnswerToDCQuestionView(APIView):
    def post(self, request):
        serializer = GetDCAnswerByIdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user: UserModel = request.user
        answer: DCQuestionAnswer = serializer.validated_data['answer_id']
        if answer.question.needs_answer is False:
            return success_with_text('this question does not need an answer')
        if DCUserAnswer.objects.filter(user=user, answer=answer).exists():
            return success_with_text('already answered')
        DCUserAnswer.objects.create(user=user, answer=answer)
        return success_with_text('ok')
