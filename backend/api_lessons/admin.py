import importlib
from pprint import pprint

from django.contrib.admin.exceptions import AlreadyRegistered

from api_lessons.models import *


@admin.register(LessonBatch)
class LessonBatchAdmin(admin.ModelAdmin):
    class LessonsInline(admin.TabularInline):
        model = Lesson
        extra = 0
        fields = ('is_available_on_free', 'title', 'order')
        show_change_link = True

    list_display = ('id', 'title')
    search_fields = list_display
    inlines = [LessonsInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    class UserPageInline(admin.TabularInline):
        model = LessonPage
        extra = 0
        fields = ('order',)
        show_change_link = True

    list_display = ('id', 'title', 'order', 'is_available_on_free',)
    search_fields = list_display

    inlines = (UserPageInline,)


@admin.register(LessonPage)
class LessonPageAdmin(admin.ModelAdmin):
    # make inline for components
    class LessonPageElementInline(admin.TabularInline):
        model = LessonPageElement
        extra = 0
        show_change_link = True

        def get_fields(self, request, obj=None):
            default_fields = ['order']
            for field in dir(LessonPageElement):
                if field.endswith('_component'):
                    default_fields.append(field)
            return default_fields

    list_display = ('lesson', 'order')
    search_fields = ('lesson', 'lesson__title')
    inlines = (LessonPageElementInline,)


@admin.register(UserLessonModel)
class UserLessonModelAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'lesson', 'completed')
    search_fields = list_display
    list_filter = ('user', 'lesson')


#
#
# -----------------------------------
# |        Lesson Components        |
# -----------------------------------


# Below is code for auto importing and registering all models from lesson_components directory
models_dir = os.path.dirname(os.path.realpath(__file__)) + '/models/lesson_components/'
model_files = [f for f in os.listdir(models_dir) if os.path.isfile(os.path.join(models_dir, f)) and f.endswith('.py')]
models_with_inlines = {}
models_just_register = []

for model_file in model_files:
    module_name = model_file[:-3]  # Remove .py extension
    module = importlib.import_module(f'api_lessons.models.lesson_components.{module_name}')
    for attr_name in dir(module):
        attr = getattr(module, attr_name)
        if isinstance(attr, type) and issubclass(attr, models.Model) and attr not in admin.site._registry:
            if attr._meta.abstract:
                continue
            just_model = True
            for field in attr._meta.fields:
                if issubclass(attr, UserMatchingComponentElementCouple):
                    continue
                if type(field) is models.ForeignKey:
                    if field.related_model in models_with_inlines:
                        continue
                    models_with_inlines[field.related_model] = models_with_inlines.get(field.related_model, []) + [attr]
                    just_model = False

            if just_model:
                models_just_register.append(attr)

for model, inlines in models_with_inlines.items():
    if model in admin.site._registry:
        continue


    def get_inline_class(inline_model):
        class Inline(admin.TabularInline):
            model = inline_model
            extra = 0
            show_change_link = True

        return Inline


    class ModelAdmin(admin.ModelAdmin):
        def __init__(self, *args, **kwargs):
            self.list_display = [field.name for field in model._meta.fields]
            self.search_fields = self.list_display
            self.inlines = [get_inline_class(inline) for inline in inlines]
            super().__init__(*args, **kwargs)


    if issubclass(model, UserModel):
        continue

    admin.site.register(model, ModelAdmin)

for model in models_just_register:
    if model in admin.site._registry:
        continue
    if issubclass(model, UserModel):
        continue
    admin.site.register(model, admin.ModelAdmin)
