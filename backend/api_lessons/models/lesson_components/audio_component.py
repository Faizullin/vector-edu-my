from typing import Type

from protected_media.models import ProtectedFileField
from django.db import models

from django.contrib import admin

from backend.global_function import PathAndRename
from .__component_base import ComponentBase


class AudioComponent(ComponentBase):
    title = models.CharField(max_length=200, verbose_name='Заголовок', default='Аудио')
    audio = ProtectedFileField(upload_to=PathAndRename('audio_components/'), verbose_name='Аудио файл')

    class Meta:
        verbose_name = 'Аудио компонент'
        verbose_name_plural = 'Аудио компоненты'

    def __str__(self):
        return f'{self.pk} AudioComponent: "{self.title}"'
