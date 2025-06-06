# Generated by Django 5.0.2 on 2024-06-10 09:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GlobalEventModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Название')),
                ('active', models.BooleanField(default=True, verbose_name='Активно')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
            ],
            options={
                'verbose_name': 'Глобальное событие',
                'verbose_name_plural': 'Глобальные события',
                'ordering': ['-pk'],
            },
        ),
        migrations.CreateModel(
            name='GlobalEventTypeModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Название')),
            ],
            options={
                'verbose_name': 'Тип глобального события',
                'verbose_name_plural': 'Типы глобальных событий',
            },
        ),
        migrations.CreateModel(
            name='GlobalEventDataModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=255, verbose_name='Ключ')),
                ('value', models.TextField(verbose_name='Значение')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='datas', to='api_global_event.globaleventmodel')),
            ],
            options={
                'verbose_name': 'Данные глобального события',
                'verbose_name_plural': 'Данные глобальных событий',
            },
        ),
        migrations.AddField(
            model_name='globaleventmodel',
            name='type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_global_event.globaleventtypemodel', verbose_name='Тип'),
        ),
    ]
