from typing import Type

from django.contrib import admin
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.safestring import mark_safe

from api_users.models import UserModel
from .__component_base import ComponentBase


class FillTextComponent(ComponentBase):
    title = models.CharField(max_length=200, verbose_name='Заголовок', default='Заполните текст')
    put_words = models.BooleanField(default=False, verbose_name='Перетаскивание слов')

    class Meta:
        verbose_name = 'Заполните текст компонент'
        verbose_name_plural = 'Заполните текст компоненты'

    def __str__(self):
        return f'{self.pk} FillTextComponent: "{self.title}"'

    def get_lesson(self):
        if hasattr(self, 'page_element'):
            return self.page_element.page.lesson
        return None


class FillTextLine(models.Model):
    component = models.ForeignKey(FillTextComponent, on_delete=models.CASCADE, verbose_name='Компонент',
                                  related_name='lines')
    text_before = models.CharField(max_length=10000, verbose_name='Текст', null=True, blank=True)
    answer = models.CharField(max_length=2000, verbose_name='Ответ (оставьте пустым если только текст )', null=True,
                              blank=True)
    text_after = models.CharField(max_length=10000, verbose_name='Текст после', null=True, blank=True)
    order = models.PositiveIntegerField(verbose_name='Порядок')

    class Meta:
        verbose_name = 'Строка компонента заполните текст'
        verbose_name_plural = 'Строки компонента заполните текст'
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} FillTextLineComponent'


class UserFillTextAnswer(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='fill_text_answers')
    line = models.ForeignKey(FillTextLine, on_delete=models.CASCADE, verbose_name='Строка', related_name='answers')
    answer = models.CharField(max_length=2000, verbose_name='Ответ')

    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата создания')

    class Meta:
        verbose_name = '[Ответ] Строка компонента заполните текст'
        verbose_name_plural = '[Ответы] Строки компонента заполните текст'

    def __str__(self):
        return f'{self.pk} UserFillTextAnswer: "{self.answer}"'
