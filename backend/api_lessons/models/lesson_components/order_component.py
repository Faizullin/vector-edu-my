from django.db import models
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .__component_base import ComponentBase


class PutInOrderComponent(ComponentBase):
    title = models.CharField(max_length=200, verbose_name='Заголовок', default='Поставьте в правильном порядке')

    class Meta:
        verbose_name = 'Поставьте в правильном порядке компонент'
        verbose_name_plural = 'Поставьте в правильном порядке компоненты'

    def __str__(self):
        return f'{self.pk} PutInOrderComponent: "{self.title}"'

    def get_lesson(self):
        if hasattr(self, 'page_element'):
            return self.page_element.page.lesson
        else:
            return None


class PutInOrderComponentElement(models.Model):
    component = models.ForeignKey(PutInOrderComponent, on_delete=models.CASCADE, related_name='elements',
                                  verbose_name='Компонент')
    text = models.CharField(max_length=2048, verbose_name='Текст элемента')
    order = models.PositiveIntegerField(verbose_name='Порядок')

    class Meta:
        verbose_name = 'Элемент компонента поставьте в правильном порядке'
        verbose_name_plural = 'Элементы компонента поставьте в правильном порядке'

    def __str__(self):
        return f'{self.pk} PutInOrderComponentElement: "{self.text}"'


class UserPutInOrderAnswer(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='put_in_order_answers')
    element = models.ForeignKey(PutInOrderComponentElement, on_delete=models.CASCADE, verbose_name='Элемент',
                                related_name='answers')
    order = models.PositiveIntegerField(verbose_name='Порядок')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата создания')

    class Meta:
        verbose_name = '[Ответ] Элемент компонента поставьте в правильном порядке'
        verbose_name_plural = '[Ответы] Элементы компонента поставьте в правильном порядке'
        ordering = ['order']

    def __str__(self):
        return f'{self.pk} UserPutInOrderAnswer: "{self.order}"'
