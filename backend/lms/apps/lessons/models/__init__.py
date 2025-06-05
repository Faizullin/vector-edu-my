from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from backend.api_lessons.models.lesson import Lesson
from lms.apps.core.utils.abstract_models import AbstractTimestampedModel


class LessonPage(AbstractTimestampedModel):
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, verbose_name="Урок", related_name="pages"
    )
    order = models.PositiveIntegerField(verbose_name="Порядок страницы в уроке")
    title = models.CharField(
        max_length=100,
        verbose_name="Заголовок страницы",
        help_text="Title of the lesson page",
        blank=True,
        null=True,
        default="",
    )

    class Meta:
        verbose_name = "Страница урока"
        verbose_name_plural = "Страницы урока"
        ordering = ["order"]
        unique_together = ("lesson", "order")

    def __str__(self):
        return f"{self.title} [#{self.pk}]"

    def get_components(self):
        """Get all components for this page ordered by their usage order"""
        return self.component_usages.select_related("content_type").prefetch_related(
            "content_object"
        )

    def add_component(self, component, order=None):
        """Add a component to this page"""
        if order is None:
            last_usage = self.component_usages.order_by("-order").first()
            order = (last_usage.order + 1) if last_usage else 1

        return PageComponentUsage.objects.create(
            page=self, content_object=component, order=order
        )


class PageComponentUsage(AbstractTimestampedModel):
    """Connects page components to lesson pages with ordering"""

    page = models.ForeignKey(
        LessonPage, related_name="component_usages", on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()

    # Generic relation to any component type
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    class Meta:
        ordering = ["page", "order"]
        unique_together = ("page", "order")
        indexes = [
            models.Index(fields=["page", "order"]),
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"Page {self.page.pk} - {self.content_object} (order: {self.order})"

    @classmethod
    def get_components_for_page(cls, page, component_type=None):
        """Filter components by page and optionally by component type"""
        queryset = cls.objects.filter(page=page).select_related("content_type")

        if component_type:
            if isinstance(component_type, str):
                # Filter by component class name
                content_type = ContentType.objects.filter(
                    model=component_type.lower()
                ).first()
            else:
                # Filter by model class
                content_type = ContentType.objects.get_for_model(component_type)

            if content_type:
                queryset = queryset.filter(content_type=content_type)

        return queryset.prefetch_related("content_object")

from .components import *
from .questions import *