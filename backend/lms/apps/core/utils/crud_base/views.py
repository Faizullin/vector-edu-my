from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import resolve_url
from django.utils.translation import gettext as _
from django.views.generic import CreateView, UpdateView, TemplateView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework import pagination
from rest_framework.authentication import SessionAuthentication
from rest_framework.filters import OrderingFilter, SearchFilter


def get_default_add_success_message(name, id):
    return "\"{}\"[{}] has been created".format(name, id)


def get_default_update_success_message(name, id):
    return "\"{}\"[{}] has been updated".format(name, id)


class BaseNavsViewMixin(object):
    def get_context_navigation_links(self):
        return {
            'navigation_links': [
                {
                    'name': 'Dashboard',
                    'url': 'lms:index',
                    'icon': 'home',
                    'submenu': []
                },
                {
                    'name': 'Resources',
                    'url': '#!',
                    'icon': 'list_alt',
                    'submenu': [
                        {
                            'name': 'Posts',
                            'url': 'lms:resources-post-list'
                        }
                    ]
                },
                {
                    'name': 'Lessons',
                    'url': '#!',
                    'icon': 'list_alt',
                    'submenu': [
                        {
                            'name': 'Dashboard',
                            'url': 'lms:lesson-dashboard'
                        },
                        {
                            'name': 'Lessons',
                            'url': 'lms:lesson-list'
                        },
                        {
                            'name': 'Lesson Pages',
                            'url': 'lms:lesson-page-list'
                        },
                    ],
                }
            ]
        }


class BaseBreadcrumbsViewMixin(object):
    def get_breadcrumbs(self, context):
        return [
            {"label": _("Dashboard"), "url": resolve_url("lms:index")},
            {"label": self.page_model_name_plural, "url": self.page_list_url},
            {"label": context['title'], "current": True},
        ]


class UseContextUrlsMixin(object):
    def get_urls(self):
        raise Exception("Not implemented")


class BaseListView(BaseNavsViewMixin, BaseBreadcrumbsViewMixin, UseContextUrlsMixin, TemplateView):
    template_name = "lms/pages/items/items-list.html"
    table = None
    page_list_url: str = None

    def __init__(self):
        super().__init__()
        self.page_model_name = self.model._meta.verbose_name
        self.page_model_name_plural = self.model._meta.verbose_name_plural

    def get_initial_super_context_data(self, **kwargs):
        return super().get_context_data(**kwargs)

    def get_context_data(self, **kwargs):
        context = self.get_initial_super_context_data(**kwargs)
        title = self.page_model_name_plural
        context.update({
            'title': title,
            'page_header_title': title,
            'card_header_title': self.page_model_name_plural,
            "table": self.table,
        })
        context["breadcrumbs"] = self.get_breadcrumbs(context)
        context["urls"] = self.get_urls()
        context.update(self.get_context_navigation_links())
        return context


class BaseCreateView(BaseNavsViewMixin, BaseBreadcrumbsViewMixin, UseContextUrlsMixin, CreateView):
    template_name = "lms/pages/items/items-edit.html"
    page_list_url: str = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.page_model_name = self.model._meta.verbose_name
        self.page_model_name_plural = self.model._meta.verbose_name_plural

    def get_initial_super_context_data(self, **kwargs):
        return super().get_context_data(**kwargs)

    def get_context_data(self, **kwargs):
        context = self.get_initial_super_context_data(**kwargs)
        title = _("Add") + " " + self.page_model_name
        context.update({
            'title': title,
            'page_header_title': title,
            'card_header_title': _("New") + " " + self.page_model_name,
        })
        context["breadcrumbs"] = self.get_breadcrumbs(context)
        context["urls"] = self.get_urls()
        context.update(self.get_context_navigation_links())
        return context

    def get_success_message(self, obj):
        raise Exception("Not implemented")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, self.get_success_message(form.instance))
        return response

    def get_urls(self):
        return {}


class BaseUpdateView(BaseNavsViewMixin, BaseBreadcrumbsViewMixin, UseContextUrlsMixin, UpdateView):
    template_name = "lms/pages/items/items-edit.html"
    page_list_url: str = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.page_model_name = self.model._meta.verbose_name
        self.page_model_name_plural = self.model._meta.verbose_name_plural

    def get_initial_super_context_data(self, **kwargs):
        return super().get_context_data(**kwargs)

    def get_context_data(self, **kwargs):
        context = self.get_initial_super_context_data(**kwargs)
        instance = self.object
        title = "{} {} [{}]".format(_("Edit"), self.page_model_name, str(instance.pk))
        context.update({
            'title': title,
            'page_header_title': title,
            'card_header_title': "{} [{}]".format(instance.title, instance.pk),
            'instance': instance,
            'attachments': {
                "content_type": ContentType.objects.get_for_model(instance).model,
                "object_id": instance.pk
            }
        })
        context["breadcrumbs"] = self.get_breadcrumbs(context)
        context["urls"] = self.get_urls()
        context.update(self.get_context_navigation_links())
        return context

    def get_success_message(self, obj):
        raise Exception("Not implemented")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, self.get_success_message(form.instance))
        return response

    def get_urls(self):
        return {}


class CustomPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class BaseListApiView(generics.ListAPIView):
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering_fields = ['id', 'created_at', 'updated_at']
    filterset_class = None
    authentication_classes = [SessionAuthentication, ]


__ALL__ = ["BaseCreateView", "BaseUpdateView", "BaseListView", "BaseListApiView"]
