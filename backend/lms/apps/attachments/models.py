import os

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from lms.apps.attachments.abstract_models import AbstractFileModel
from lms.apps.core.utils.abstract_models import AbstractTimestampedModel, models


class Attachment(AbstractFileModel, AbstractTimestampedModel):
    attachment_type = models.CharField(max_length=20)
    content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    content_object = GenericForeignKey("content_type", "object_id")

    def save(self, *args, **kwargs) -> None:
        if self.file:
            self.name = self.file.name
            self.extension = os.path.splitext(self.name)[1]
            self.size = self.file.size
        super().save(*args, **kwargs)
