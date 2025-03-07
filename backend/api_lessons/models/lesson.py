from django.db import models
from api_users.models import UserModel


class LessonBatchNames:
    @staticmethod
    def choices():
        return (
            ('listening', 'Listening'),
            ('speaking', 'Speaking'),
            ('reading', 'Reading'),
            ('writing', 'Writing'),
            ('addition', 'Additional'),
        )


class LessonBatch(models.Model):
    title = models.CharField(max_length=255, choices=LessonBatchNames.choices(),
                             verbose_name='Название коллекции уроков')

    def __str__(self):
        return f'{self.pk} Lesson Batch: "{self.title}"'

    class Meta:
        verbose_name = 'Коллекция уроков'
        verbose_name_plural = '1 Коллекции уроков'


class Lesson(models.Model):
    is_available_on_free = models.BooleanField(default=False, verbose_name='Доступен на бесплатном тарифе')
    lesson_batch = models.ForeignKey(LessonBatch, on_delete=models.CASCADE, verbose_name='Коллекция уроков',
                                     related_name='lessons')
    title = models.CharField(max_length=200, verbose_name='Тема')
    description = models.CharField(max_length=4096, verbose_name='Описание')
    order = models.IntegerField(verbose_name='Порядок урока в коллекции')

    def __str__(self):
        return f'{self.pk} Lesson: {self.title} Order: {self.order} in {self.lesson_batch.title}'

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = '2 Уроки'
        ordering = ['order']

    def is_available_for_user(self, user: UserModel) -> bool:
        return self.is_available_on_free or user.is_paid()

    def is_lesson_done_for_user(self, user: UserModel) -> str:
        from .lesson_components.fill_text_component import FillTextLine
        from .lesson_components.matching_component import MatchingComponentElementCouple
        from .lesson_components.order_component import PutInOrderComponentElement

        components = [
            (FillTextLine, 'answers__user'),
            (MatchingComponentElementCouple, 'user_couples__user'),
            (PutInOrderComponentElement, 'answers__user'),
        ]

        for component, related_name in components:
            if not self._is_component_done_for_user(component, related_name, user):
                return f'{component} is not done'

        from .lesson_components.recording_component import RecordAudioComponent
        record_components = RecordAudioComponent.objects.filter(page_element__page__lesson=self)
        record_components_answered_by_user = record_components.filter(user_records__user=user)
        if record_components.count() > record_components_answered_by_user.count():
            return 'record components are not done'

        from .lesson_components.question_component import QuestionAnswer, QuestionComponent
        this_lesson_questions = QuestionComponent.objects.filter(page_element__page__lesson=self)
        questions_answered_by_user = QuestionAnswer.objects.filter(component__in=this_lesson_questions,
                                                                   user_answers__user=user, is_correct=True)
        if questions_answered_by_user.count() < this_lesson_questions.count():
            return 'questions are not done'

        return 'ok'

    def _is_component_done_for_user(self, component, related_name, user):
        this_lesson_components = component.objects.filter(component__page_element__page__lesson=self)
        components_answered_by_user = this_lesson_components.filter(**{related_name: user})
        # print(component, related_name)
        # print(this_lesson_components.count(), components_answered_by_user.count())
        return components_answered_by_user.count() >= this_lesson_components.count()
