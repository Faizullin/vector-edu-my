from protected_media.models import ProtectedImageField
from django.db import models
from .__component_base import ComponentBase


class VideoComponent(ComponentBase):
    description = models.CharField(max_length=2000, verbose_name='Описание')
    video_url = models.URLField(verbose_name='Ссылка на видео')

    class Meta:
        verbose_name = 'Видео компонент'
        verbose_name_plural = 'Видео компоненты'

    def __str__(self):
        return f'{self.pk} VideoComponent: "{self.description}"'
