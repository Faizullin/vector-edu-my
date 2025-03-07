from protected_media.models import ProtectedImageField
from django.db import models
from .__component_base import ComponentBase


class TextComponent(ComponentBase):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст')

    class Meta:
        verbose_name = 'Текст компонент'
        verbose_name_plural = 'Текст компоненты'

    def __str__(self):
        return f'{self.pk} TextComponent: "{self.title}"'
