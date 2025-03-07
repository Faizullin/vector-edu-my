from django.urls import path
from .views import *

urlpatterns = [
    path('get_lesson_batch/', GetAdditionalLessonBatchWithoutComponentsView.as_view()),
    path('get_lesson/', GetAdditionalLessonView.as_view()),
]
