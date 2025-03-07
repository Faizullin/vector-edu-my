from protected_media.models import ProtectedImageField

from backend.global_function import PathAndRename
from .__component_base import ComponentBase
from django.db import models


class ImageComponent(ComponentBase):
    description = models.CharField(max_length=200, verbose_name='Описание', default='Изображение', null=True,
                                   blank=True)
    image = ProtectedImageField(upload_to=PathAndRename('images/'), verbose_name='Изображение')

    class Meta:
        verbose_name = 'Изображение компонент'
        verbose_name_plural = 'Изображения компоненты'

    def __str__(self):
        return f'{self.pk} ImageComponent '
