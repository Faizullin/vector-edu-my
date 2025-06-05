from django.contrib import admin
from .models import (
    LessonPage,
    PageComponentUsage,
    TemplateComponent,
    VimeoUrlCacheModel,
    Question,
    MultipleChoiceOption,
    OrderingItem,
    FillInBlankLine,
    MatchingElement,
    MatchingPair,
    RecordAudioQuestion,
)


@admin.register(LessonPage)
class LessonPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at", "updated_at")
    search_fields = ("title",)
    list_filter = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(PageComponentUsage)
class PageComponentUsageAdmin(admin.ModelAdmin):
    list_display = ("id", "content_type", "object_id", "created_at")
    search_fields = ("content_type__model", "object_id")
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(TemplateComponent)
class TemplateComponentAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "component_type", "created_at")
    search_fields = ("title", "component_type")
    list_filter = ("component_type", "created_at")
    ordering = ("-created_at",)


@admin.register(VimeoUrlCacheModel)
class VimeoUrlCacheModelAdmin(admin.ModelAdmin):
    list_display = ("id", "vimeo_link", "created_at")
    search_fields = ("vimeo_link",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "text", "created_at")
    search_fields = ("text",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(MultipleChoiceOption)
class MultipleChoiceOptionAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "is_correct", "created_at")
    search_fields = ("text",)
    list_filter = ("is_correct", "created_at")
    ordering = ("-created_at",)


@admin.register(OrderingItem)
class OrderingItemAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "correct_order", "created_at")
    search_fields = ("text",)
    list_filter = ("correct_order", "created_at")
    ordering = ("-created_at",)


@admin.register(FillInBlankLine)
class FillInBlankLineAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "created_at")
    search_fields = ("text",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(MatchingElement)
class MatchingElementAdmin(admin.ModelAdmin):
    list_display = ("id", "text", "created_at")
    search_fields = ("text",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(MatchingPair)
class MatchingPairAdmin(admin.ModelAdmin):
    list_display = ("id", "left_element", "right_element", "created_at")
    search_fields = ("left_element__text", "right_element__text")
    list_filter = ("created_at",)
    ordering = ("-created_at",)


@admin.register(RecordAudioQuestion)
class RecordAudioQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)
