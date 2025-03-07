from django.contrib import admin
from .models import *


# Register your models here.
@admin.register(AdditionalLessonBatch)
class AdditionalLessonBatchAdmin(admin.ModelAdmin):
    class AdditionalLessonInline(admin.TabularInline):
        model = AdditionalLesson
        show_change_link = True
        extra = 0

    inlines = [AdditionalLessonInline]
    list_display = ['title', 'order', 'timestamp']
    search_fields = ['title']


@admin.register(AdditionalLesson)
class AdditionalLessonAdmin(admin.ModelAdmin):
    class AdditionalLessonElementInline(admin.TabularInline):
        model = AdditionalLessonElement
        show_change_link = True
        extra = 0

    inlines = [AdditionalLessonElementInline]
    list_display = ['title', 'order', 'timestamp']
    search_fields = ['title']


@admin.register(AdditionalLessonElement)
class AdditionalLessonElementAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'order']
    search_fields = ['lesson__title']


@admin.register(AdditionalAudioComponent)
class AdditionalAudioComponentAdmin(admin.ModelAdmin):
    list_display = ['title']
    search_fields = ['title']


@admin.register(AdditionalImageComponent)
class AdditionalImageComponentAdmin(admin.ModelAdmin):
    list_display = ['description', 'image']
    search_fields = ['description']


@admin.register(AdditionalTextComponent)
class AdditionalTextComponentAdmin(admin.ModelAdmin):
    list_display = ['title']
    search_fields = ['title']


@admin.register(AdditionalVideoComponent)
class AdditionalVideoComponentAdmin(admin.ModelAdmin):
    list_display = ['description', 'video_url']
    search_fields = ['description']
