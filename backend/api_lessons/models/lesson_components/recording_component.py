from django.db import models
from protected_media.models import ProtectedFileField

from backend.global_function import PathAndRename
from .__component_base import ComponentBase


class RecordAudioComponent(ComponentBase):
    title = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')

    class Meta:
        verbose_name = 'Запись аудио компонент'
        verbose_name_plural = 'Запись аудио компоненты'

    def __str__(self):
        return f'{self.pk} RecordAudioComponent '

    def get_lesson(self):
        if hasattr(self, 'page_element'):
            return self.page_element.page.lesson
        else:
            return None


class UserRecordAudioComponent(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='record_audio_components')
    component = models.ForeignKey(RecordAudioComponent, on_delete=models.CASCADE, verbose_name='Компонент',
                                  related_name='user_records')
    file = ProtectedFileField(upload_to=PathAndRename(path='record_component_answer/'), verbose_name='Аудио файл')
    teacher_comment = models.TextField(verbose_name='Комментарий учителя', blank=True, null=True)

    class Meta:
        verbose_name = '[Ответ] Аудио компонент'
        verbose_name_plural = '[Ответ] Аудио компоненты'

    def __str__(self):
        return f'{self.pk} UserRecordAudioComponent'
