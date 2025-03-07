from django.db import models
from protected_media.models import ProtectedImageField, ProtectedFileField

from backend.global_function import PathAndRename


class AdditionalImageComponent(models.Model):
    description = models.CharField(max_length=200, verbose_name='Описание', default='Изображение', null=True,
                                   blank=True)
    image = ProtectedImageField(upload_to=PathAndRename('additional_images/'), verbose_name='Изображение')

    class Meta:
        verbose_name = 'Изображение компонент'
        verbose_name_plural = 'Изображения компоненты'

    def __str__(self):
        return f'{self.pk} ImageComponent '


class AdditionalAudioComponent(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок', default='Аудио')
    audio = ProtectedFileField(upload_to=PathAndRename('additional_audio_components/'), verbose_name='Аудио файл')

    class Meta:
        verbose_name = 'Аудио компонент'
        verbose_name_plural = 'Аудио компоненты'

    def __str__(self):
        return f'{self.pk} AudioComponent: "{self.title}"'


class AdditionalTextComponent(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст')

    class Meta:
        verbose_name = 'Текст компонент'
        verbose_name_plural = 'Текст компоненты'

    def __str__(self):
        return f'{self.pk} TextComponent: "{self.title}"'


class AdditionalVideoComponent(models.Model):
    description = models.CharField(max_length=2000, verbose_name='Описание')
    video_url = models.URLField(verbose_name='Ссылка на видео')

    class Meta:
        verbose_name = 'Видео компонент'
        verbose_name_plural = 'Видео компоненты'

    def __str__(self):
        return f'{self.pk} VideoComponent: "{self.description}"'
