from django.db import models
from rest_framework.exceptions import ValidationError

from .components import AdditionalAudioComponent, AdditionalImageComponent, AdditionalTextComponent, \
    AdditionalVideoComponent


# Create your models here.
class AdditionalLessonBatch(models.Model):
    title = models.CharField(max_length=100)
    order = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} - Lesson Batch: {self.title}'


class AdditionalLesson(models.Model):
    title = models.CharField(max_length=512)
    lesson_batch = models.ForeignKey(AdditionalLessonBatch, on_delete=models.CASCADE, related_name='lessons')
    order = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} - Lesson: {self.title}'


class AdditionalLessonElement(models.Model):
    class Meta:
        verbose_name = 'Элемент страницы урока'
        verbose_name_plural = 'Элементы страницы урока'
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} LessonPageElement'

    def save(self, *args, **kwargs):
        if not self.audio_component and not self.image_component and not self.text_component and not self.video_component:
            raise ValidationError('At least one component must be filled')
        super().save(*args, **kwargs)

    lesson = models.ForeignKey(AdditionalLesson, on_delete=models.CASCADE, related_name='elements',
                               verbose_name='Страница')
    order = models.PositiveIntegerField(verbose_name='Порядок элемента на уроке')

    # components:  :3
    audio_component = models.OneToOneField(AdditionalAudioComponent, on_delete=models.CASCADE,
                                           related_name='additional_lesson_element', blank=True, null=True)
    video_component = models.OneToOneField(AdditionalVideoComponent, on_delete=models.CASCADE,
                                           related_name='additional_lesson_element', blank=True, null=True)
    text_component = models.OneToOneField(AdditionalTextComponent, on_delete=models.CASCADE,
                                          related_name='additional_lesson_element', blank=True, null=True)
    image_component = models.OneToOneField(AdditionalImageComponent, on_delete=models.CASCADE,
                                           related_name='additional_lesson_element', blank=True, null=True)
