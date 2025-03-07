from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import Attachment

@receiver(pre_delete, sender=Attachment)
def pre_delete_files(sender, instance: Attachment, *args, **kwargs):
    try:
        instance.file.delete(save=False)
    except:
        pass
