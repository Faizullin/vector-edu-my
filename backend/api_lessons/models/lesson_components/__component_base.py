from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.db import models
from rest_framework.exceptions import ValidationError

from api_lessons.models import Lesson


class LessonPage(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, verbose_name='Урок', related_name='pages')
    order = models.PositiveIntegerField(verbose_name='Порядок страницы в уроке')

    class Meta:
        verbose_name = 'Страница урока'
        verbose_name_plural = 'Страницы урока'
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} LessonPage'


class ComponentBase(models.Model):
    class Meta:
        verbose_name = 'Базовый компонент'
        verbose_name_plural = 'Базовые компоненты'
        abstract = True

    def __str__(self):
        return f'{self.pk} {self.__class__.__name__}'
