# Generated by Django 5.0.2 on 2024-06-16 17:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api_users', '0015_alter_usermodel_is_deleted'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usermodel',
            name='is_deleted',
        ),
    ]
