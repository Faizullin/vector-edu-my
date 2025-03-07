from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponseRedirect
from django.shortcuts import resolve_url, get_object_or_404
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.views import View
from rest_framework.reverse import reverse_lazy

from api_lessons.models import Lesson, LessonPage
from lms.apps.core.utils.crud_base.tables import Table, Column, ActionsColumn, DefaultEditAction, ButtonAction
from lms.apps.core.utils.crud_base.views import BaseCreateView, BaseUpdateView, get_default_add_success_message, \
    get_default_update_success_message, BaseListView
from lms.apps.posts.models import Post
from .forms import LessonForm, LessonPageForm
from .url_reverses import url_reverses_dict


class LessonDashboardView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponseRedirect(reverse("lms:lesson-list"))


class LessonListView(BaseListView):
    template_name = "lms/lessons/lessons-list.html"
    model = Lesson
    page_list_url = reverse_lazy("lms:lesson-list")

    class LessonTable(Table):
        id = Column(field_name="id", header="#", orderable=True)
        is_available_on_free = Column(field_name="is_available_on_free")
        lesson_batch = Column(field_name="lesson_batch.title", header=_("Lesson Batch"))
        title = Column(field_name="title", searchable=True)
        description = Column(field_name="description", searchable=True)
        order = Column(field_name="order", orderable=True)
        actions = ActionsColumn(
            actions=[
                DefaultEditAction(
                    redirect_url_name=url_reverses_dict["lesson-update"],
                ),
            ],
            extra_actions=[
                ButtonAction(
                    name='open-pages',
                    redirect_url_name=url_reverses_dict["lesson-id-page-action"],
                    label=_("Pages"),
                ),
            ],
        )

        class Meta:
            model = Lesson
            source_url = reverse_lazy('lms:lesson-list-api')
            fields = ['id', 'is_available_on_free', 'lesson_batch', 'title', 'order', "actions"]

    table = LessonTable()

    def get_queryset(self):
        return Lesson.objects.all().prefetch_related("lesson_batch")

    def get_urls(self):
        return {
            'add': reverse('lms:lesson-create'),
        }


class LessonCreateView(BaseCreateView):
    model = Lesson
    form_class = LessonForm
    page_list_url = reverse_lazy("lms:lesson-list")

    def get_success_message(self, obj):
        return get_default_add_success_message(obj.title, obj.id)

    def get_success_url(self):
        return resolve_url("lms:lesson-update", pk=self.object.pk)

    def get_urls(self):
        return {}


class LessonUpdateView(BaseUpdateView):
    model = Lesson
    form_class = LessonForm
    page_list_url = reverse_lazy("lms:lesson-list")

    def get_success_message(self, obj):
        return get_default_update_success_message(obj.title, obj.id)

    def get_success_url(self):
        return resolve_url("lms:lesson-update", pk=self.object.pk)

    def get_urls(self):
        return {}


class LessonPageListView(BaseListView):
    model = LessonPage
    page_list_url = reverse_lazy("lms:lesson-page-list")

    class LessonPageTable(Table):
        id = Column(field_name="id", header="#", orderable=True)
        lesson = Column(field_name="lesson.title")
        order = Column(field_name="order", orderable=True)
        actions = ActionsColumn(
            actions=[
                DefaultEditAction(
                    redirect_url_name=url_reverses_dict["lesson-page-update"],
                ),
            ],
        )

        class Meta:
            model = LessonPage
            source_url = reverse_lazy('lms:lesson-page-list-api')
            fields = ['id', 'order', 'lesson', ]

    table = LessonPageTable()

    def get_queryset(self):
        return LessonPage.objects.all().prefetch_related("lesson")

    def get_urls(self):
        return {
            'add': reverse('lms:lesson-page-create'),
        }


class LessonPageCreateView(BaseCreateView):
    model = LessonPage
    form_class = LessonPageForm
    page_list_url = reverse_lazy("lms:lesson-page-list")

    def get_success_message(self, obj):
        return get_default_add_success_message(obj.title, obj.id)

    def get_success_url(self):
        return resolve_url("lms:lesson-page-update", pk=self.object.pk)

    def get_urls(self):
        return {}


class LessonPageUpdateView(BaseUpdateView):
    model = LessonPage
    form_class = LessonPageForm
    page_list_url = reverse_lazy("lms:lesson-page-list")

    def get_success_message(self, obj):
        return get_default_update_success_message(obj.title, obj.id)

    def get_success_url(self):
        return resolve_url("lms:lesson-page-update", pk=self.object.pk)

    def get_urls(self):
        return {}


class LessonPageOpenEditor(View):

    def get(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        lesson_page_obj = get_object_or_404(LessonPage, id=pk)
        ctype = ContentType.objects.get_for_model(Lesson)
        try:
            post_obj = Post.objects.get(content_type=ctype.id, object_id=lesson_page_obj.id)
        except Post.DoesNotExist:
            author = request.user
            title = f"Post for lesson page [{lesson_page_obj.id}]` #{lesson_page_obj.order}"
            post_obj = Post.objects.create(
                title=title,
                author=author,
                post_type="editor",
                content_type=ctype,
                object_id=lesson_page_obj.id
            )

        return HttpResponseRedirect(reverse("lms:resources-post-edit-content", kwargs={"pk": post_obj.id}))


class LessonNestedPageActionView(BaseListView):
    template_name = "lms/lessons/lesson-id-page-action.html"
    model = LessonPage
    page_list_url = reverse_lazy("lms:lesson-page-list")

    class LessonPageTable(Table):
        id = Column(field_name="id", header="#", orderable=False)
        order = Column(field_name="order", orderable=False)
        actions = ActionsColumn(
            actions=[
                DefaultEditAction(
                    redirect_url_name=url_reverses_dict["lesson-page-update"],
                ),
            ],
            extra_actions=[
                ButtonAction(
                    name='open-editor',
                    redirect_url_name=url_reverses_dict["lesson-page-open-editor"],
                    label=_("Open Editor"),
                ),
            ]
        )

        class Meta:
            model = LessonPage
            source_url = reverse_lazy('lms:lesson-page-list-api')
            fields = [ 'order', 'id','actions']

    table = LessonPageTable()

    def get_queryset(self):
        return LessonPage.objects.all().prefetch_related("lesson")

    def get(self, request, *args, **kwargs):
        lesson = get_object_or_404(Lesson, id=self.kwargs.get("lesson_id"))
        context = self.get_context_data(lesson=lesson)
        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "lesson": get_object_or_404(Lesson, id=self.kwargs.get("lesson_id")),
        })
        return context

    def get_urls(self):
        return {
            'add': reverse('lms:lesson-page-create'),
        }
