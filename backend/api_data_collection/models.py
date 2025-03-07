from django.db import models


# Create your models here.
class DCQuestion(models.Model):
    question_text = models.CharField(max_length=2000, verbose_name='Текст вопроса')
    needs_answer = models.BooleanField(default=True, verbose_name='Требуется ответ')

    def __str__(self):
        return f'{self.pk} DCQuestion: {self.question_text}'

    class Meta:
        verbose_name = 'Вопрос (Дата коллекция)'
        verbose_name_plural = 'Вопросы (Дата коллекция)'
        ordering = ['id']


class DCQuestionAnswer(models.Model):
    question = models.ForeignKey(DCQuestion, on_delete=models.CASCADE, verbose_name='Вопрос',
                                 related_name='answers')
    answer_text = models.CharField(max_length=2000, verbose_name='Текст ответа')

    def __str__(self):
        return f'{self.pk} DCQuestionAnswer: {self.answer_text}'

    class Meta:
        verbose_name = 'Ответ на вопрос (Дата коллекция)'
        verbose_name_plural = 'Ответы на вопросы (Дата коллекция)'
        ordering = ['id']


class DCUserAnswer(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='dc_answers')
    answer = models.ForeignKey(DCQuestionAnswer, on_delete=models.CASCADE, verbose_name='Ответ',
                               related_name='user_answers')

    def __str__(self):
        return f'{self.pk} DCUserAnswer'

    class Meta:
        verbose_name = 'Ответ пользователя (Дата коллекция)'
        verbose_name_plural = 'Ответы пользователей (Дата коллекция)'