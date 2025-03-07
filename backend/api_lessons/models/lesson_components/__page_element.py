from django.db import models
from rest_framework.exceptions import ValidationError

from .__component_base import LessonPage


class LessonPageElement(models.Model):
    class Meta:
        verbose_name = 'Элемент страницы урока'
        verbose_name_plural = 'Элементы страницы урока'
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} LessonPageElement'

    page = models.ForeignKey(LessonPage, on_delete=models.CASCADE, related_name='elements', verbose_name='Страница')
    order = models.PositiveIntegerField(verbose_name='Порядок элемента на странице')

    # components:  :3
    matching_component = models.OneToOneField('api_lessons.MatchingComponent', on_delete=models.CASCADE,
                                              related_name='page_element', blank=True, null=True)
    audio_component = models.OneToOneField('api_lessons.AudioComponent', on_delete=models.CASCADE,
                                           related_name='page_element', blank=True, null=True)
    blue_card_component = models.OneToOneField('api_lessons.BlueCardComponent', on_delete=models.CASCADE,
                                               related_name='page_element', blank=True, null=True)
    fill_text_component = models.OneToOneField('api_lessons.FillTextComponent', on_delete=models.CASCADE,
                                               related_name='page_element', blank=True, null=True)
    image_component = models.OneToOneField('api_lessons.ImageComponent', on_delete=models.CASCADE,
                                           related_name='page_element', blank=True, null=True)
    put_in_order_component = models.OneToOneField('api_lessons.PutInOrderComponent', on_delete=models.CASCADE,
                                                  related_name='page_element', blank=True, null=True)
    question_component = models.OneToOneField('api_lessons.QuestionComponent', on_delete=models.CASCADE,
                                              related_name='page_element', blank=True, null=True)
    record_audio_component = models.OneToOneField('api_lessons.RecordAudioComponent', on_delete=models.CASCADE,
                                                  related_name='page_element', blank=True, null=True)
    text_component = models.OneToOneField('api_lessons.TextComponent', on_delete=models.CASCADE,
                                          related_name='page_element', blank=True, null=True)
    video_component = models.OneToOneField('api_lessons.VideoComponent', on_delete=models.CASCADE,
                                           related_name='page_element', blank=True, null=True)
