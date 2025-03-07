from decimal import Decimal

from django.db import models
from api_users.models import UserModel
from api_lessons.models import Lesson
from django.core.validators import MinValueValidator, MaxValueValidator

PERCENTAGE_VALIDATOR = [MinValueValidator(0), MaxValueValidator(100)]


class UserLessonModel(models.Model):
    user = models.ForeignKey('api_users.UserModel', on_delete=models.CASCADE, verbose_name='Пользователь',
                             related_name='lessons')
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE, verbose_name='Урок')
    completed = models.BooleanField(default=False, verbose_name='Урок завершен')
    review_mark = models.IntegerField(null=True, blank=True, verbose_name='Оценка урока')
    review_comment = models.CharField(max_length=4096, null=False, blank=True, verbose_name='Комментарий к уроку')
