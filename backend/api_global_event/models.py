from django.db import models


# Create your models here.
class GlobalEventTypes:
    warning = 'warning'
    error = 'error'
    bars = 'bars'

    @staticmethod
    def choices():
        return (
            (GlobalEventTypes.warning, 'Warning'),
            (GlobalEventTypes.error, 'Error'),
            (GlobalEventTypes.bars, 'Bars'),
        )


class GlobalEventModel(models.Model):
    title = models.CharField(max_length=255, verbose_name='Название')
    type = models.CharField(max_length=255, choices=GlobalEventTypes.choices(), verbose_name='Тип')
    active = models.BooleanField(default=True, verbose_name='Активно')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Глобальное событие'
        verbose_name_plural = 'Глобальные события'
        ordering = ['-pk']

    def __str__(self):
        return f'{self.pk} Global Event'

    def save(self, *args, **kwargs):
        # Если событие активно, то деактивируем все другие события такого же типа
        if self.active:
            GlobalEventModel.objects.filter(active=True).update(active=False)
        super().save(*args, **kwargs)


class GlobalEventDataModel(models.Model):
    key = models.CharField(max_length=255, verbose_name='Ключ')
    value = models.TextField(verbose_name='Значение')
    event = models.ForeignKey(GlobalEventModel, on_delete=models.CASCADE, related_name='datas')

    class Meta:
        verbose_name = 'Данные глобального события'
        verbose_name_plural = 'Данные глобальных событий'

    def __str__(self):
        return f'{self.pk} Global Event Data'


