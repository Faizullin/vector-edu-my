from typing import Type

from django.db import models

from .__component_base import ComponentBase


class BlueCardComponent(ComponentBase):
    text = models.TextField(verbose_name='Текст', default='Текст')

    class Meta:
        verbose_name = 'Blue Card компонент'
        verbose_name_plural = 'Blue Card компоненты'

    def __str__(self):
        return f'{self.pk} BlueCardComponent'
