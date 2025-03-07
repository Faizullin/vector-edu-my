from django.contrib import admin
from .models import *


# Register your models here.
@admin.register(DCQuestion)
class DCQuestionAdmin(admin.ModelAdmin):
    class DCAnswersInline(admin.TabularInline):
        model = DCQuestionAnswer
        extra = 0
        fields = ['answer_text']

    list_display = ['id', 'question_text']
    search_fields = ['question_text']
    list_filter = ['id']
    inlines = [DCAnswersInline]


@admin.register(DCQuestionAnswer)
class DCQuestionAnswerAdmin(admin.ModelAdmin):
    class DCQuestionInline(admin.TabularInline):
        model = DCUserAnswer
        extra = 0
        fields = ['user', 'answer']

    list_display = ['id', 'question', 'answer_text']
    search_fields = ['question', 'answer_text']
    list_filter = ['id']
    inlines = [DCQuestionInline]


@admin.register(DCUserAnswer)
class DCUserAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'answer']
    search_fields = ['user', 'answer']
    list_filter = ['id']
