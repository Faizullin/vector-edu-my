from django.urls import path

from .views import *

urlpatterns = [
    path('get_questions/', GetDCQuestionsView.as_view()),
    path('answer_dc_question/', AnswerToDCQuestionView.as_view()),
]
