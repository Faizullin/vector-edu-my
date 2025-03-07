from django.contrib import admin
from .models import *


@admin.register(GlobalEventModel)
class GlobalEventModelAdmin(admin.ModelAdmin):
    class GlobalEventDataInline(admin.TabularInline):
        model = GlobalEventDataModel
        extra = 0

    list_display = ['pk', 'title', 'type', 'active', 'created_at']
    search_fields = ['title']
    list_filter = ['type', 'active', 'created_at']
    inlines = [GlobalEventDataInline]


@admin.register(GlobalEventDataModel)
class GlobalEventDataModelAdmin(admin.ModelAdmin):
    list_display = ['pk', 'key', 'value', 'event']
    search_fields = ['key', 'value']
    list_filter = ['event']
