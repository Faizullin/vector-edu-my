# Generated by Django 5.0.2 on 2024-06-15 10:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_lessons', '0055_vimeourlcachemodel'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='filltextline',
            options={'ordering': ['order'], 'verbose_name': 'Строка компонента заполните текст', 'verbose_name_plural': 'Строки компонента заполните текст'},
        ),
        migrations.AlterModelOptions(
            name='userputinorderanswer',
            options={'ordering': ['order'], 'verbose_name': '[Ответ] Элемент компонента поставьте в правильном порядке', 'verbose_name_plural': '[Ответы] Элементы компонента поставьте в правильном порядке'},
        ),
        migrations.AlterField(
            model_name='vimeourlcachemodel',
            name='playable_video_link',
            field=models.URLField(max_length=1024, verbose_name='Ссылка на видеофайл'),
        ),
        migrations.AlterField(
            model_name='vimeourlcachemodel',
            name='vimeo_link',
            field=models.URLField(max_length=1024, verbose_name='Ссылка на видео'),
        ),
    ]
