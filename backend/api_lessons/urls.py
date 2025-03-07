from django.urls import path
from .views import *

urlpatterns = [
    path('get_lesson_batch/', GetLessonsBatchView.as_view()),
    path('get_lesson/', GetLessonView.as_view()),
    path('check_lesson_for_ending/', CheckLessonForEnding.as_view()),
    path('get_friends_on_lesson/', GetFriendsOnLessonView.as_view()),
    path('review_lesson/', LeaveReviewOnLessonView.as_view()),

    #
    path('add_lesson/', AddLessonToBatchView.as_view()),

    # answer to components
    path('answer_to_fill_text/', AnswerFillTextComponentView.as_view()),
    path('answer_matching_component/', AnswerMatchingComponentView.as_view()),
    path('answer_put_in_order_component/', AnswerPutInOrderComponentView.as_view()),
    path('answer_question_component/', AnswerQuestionComponentView.as_view()),
    path('answer_record_audio_component/', AnswerRecordAudioComponentView.as_view()),
]
