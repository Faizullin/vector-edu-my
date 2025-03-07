from protected_media.models import ProtectedImageField
from django.db import models
from .__component_base import ComponentBase


class QuestionComponent(ComponentBase):
    text = models.CharField(max_length=2000, verbose_name='Текст вопроса')

    class Meta:
        verbose_name = 'Вопрос компонент'
        verbose_name_plural = 'Вопросы компоненты'
        ordering = ['id']

    def __str__(self):
        return f'{self.pk} QuestionComponent: "{self.text}"'

    def get_lesson(self):
        if hasattr(self, 'page_element'):
            return self.page_element.page.lesson
        else:
            return None


class QuestionAnswer(models.Model):
    component = models.ForeignKey(QuestionComponent, on_delete=models.CASCADE, verbose_name='Вопрос',
                                  related_name='answers')
    text = models.CharField(max_length=2000, verbose_name='Ответ')
    is_correct = models.BooleanField(default=False, verbose_name='Правильный ответ')

    def __str__(self):
        return f'{self.pk} QuestionAnswer: "{self.text}"'

    class Meta:
        verbose_name = 'Ответ на вопрос'
        verbose_name_plural = 'Ответы на вопросы'


class UserQuestionAnswer(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='question_answers')
    answer = models.ForeignKey(QuestionAnswer, on_delete=models.CASCADE, verbose_name='Ответ',
                               related_name='user_answers')

    class Meta:
        verbose_name = '[Ответ] Вопрос компонент'
        verbose_name_plural = '[Ответы] Вопросы компонент'

    def __str__(self):
        return f'{self.pk} UserQuestionAnswer: '
