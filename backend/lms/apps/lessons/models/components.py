from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from lms.apps.lessons.utils import get_truncated_name
from lms.apps.attachments.models import Attachment
from lms.apps.core.utils.abstract_models import AbstractTimestampedModel


class BasePageComponent(AbstractTimestampedModel):
    """Base class for all page components"""

    component_type = models.CharField(max_length=100, editable=False)
    is_active = models.BooleanField(default=True)

    # Generic relation to PageComponentUsage
    usages = GenericRelation(
        "PageComponentUsage",
        content_type_field="content_type",
        object_id_field="object_id",
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.component_type:
            self.component_type = self.__class__.__name__
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.component_type} [#{self.pk}]"


class TemplateComponent(BasePageComponent):
    """Template for page components"""

    title = models.CharField(
        max_length=100,
        verbose_name="Title",
        help_text="Title of the component template",
    )
    content = models.TextField(
        verbose_name="Content",
        help_text="Template content for the component",
    )

    class Meta:
        verbose_name = "Component Template"
        verbose_name_plural = "Component Templates"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.component_type = "template"

    def __str__(self):
        return f"{get_truncated_name(self.title)} [#{self.pk}]"


class VimeoUrlCacheModel(AbstractTimestampedModel):
    vimeo_link = models.URLField(verbose_name="Ссылка на видео", max_length=1024)
    playable_video_link = models.URLField(
        verbose_name="Ссылка на видеофайл", max_length=1024
    )
    expire_time = models.DateTimeField(verbose_name="Время истечения ссылки")

    class Meta:
        verbose_name = "Кэш ссылок Vimeo"
        verbose_name_plural = "Кэш ссылок Vimeo"
