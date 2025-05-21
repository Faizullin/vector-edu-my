import json
from django.contrib.contenttypes.models import ContentType
from api_lessons.models.lesson_components.__page_element import LessonPageElement
from django_filters import CharFilter, NumberFilter
from django_filters.rest_framework import FilterSet
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from api_lessons.models import Lesson, LessonPage, LessonBatch
from lms.apps.core.utils.api_actions import BaseActionException
from lms.apps.core.utils.crud_base.views import BaseApiViewSet
from lms.apps.posts.models import Post
from .serializers import (
    LessonSerializer,
    LessonPageSerializer,
    LessonSubmitSerializer,
    LessonBatchSerializer,
    LessonPageReorderSubmitSerializer,
)
from django.utils import timezone

from ...resources.lesson_page_editor.api.components_utils import COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT


class LessonsBatchViewSet(BaseApiViewSet):
    search_fields = [
        "title",
    ]
    ordering_fields = [
        "id",
    ]

    class LessonBatchFilter(FilterSet):
        title = CharFilter(lookup_expr="icontains")

        class Meta:
            model = LessonBatch
            fields = [
                "id",
                "title",
            ]

    filterset_class = LessonBatchFilter

    def get_queryset(self):
        queryset = LessonBatch.objects.annotate(
            lesson_count=Count("lessons")
        ).prefetch_related("lessons")
        return queryset

    def get_serializer_class(self):
        return LessonBatchSerializer


class LessonsLessonViewSet(BaseApiViewSet):
    search_fields = ["title", "description"]
    ordering_fields = ["id", "order"]

    class LessonFilter(FilterSet):
        title = CharFilter(lookup_expr="icontains")
        batch_id = NumberFilter(field_name="lesson_batch", lookup_expr="exact")

        class Meta:
            model = Lesson
            fields = [
                "id",
                "title",
                "batch_id",
                "is_available_on_free",
            ]

    filterset_class = LessonFilter

    def get_queryset(self):
        return Lesson.objects.all()

    def perform_create(self, serializer):
        kwargs = serializer.validated_data
        kwargs["order"] = (
            Lesson.objects.filter(lesson_batch=kwargs["lesson_batch"]).count() + 1
        )
        return Lesson.objects.create(**kwargs)

    def get_serializer_class(self):
        if self.request.method in ["POST", "PUT", "PATCH"]:
            return LessonSubmitSerializer
        return LessonSerializer


def create_initial_lesson_editor_post_content(lesson_page_obj: LessonPage, request):
    elements: LessonPageElement = lesson_page_obj.elements.all()
    initial_data = []
    for element in elements:
        for (
            key,
            key_component_field_name,
        ) in COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT.items():
            component_value = getattr(element, key_component_field_name)
            if component_value:
                initial_data.append(
                    {
                        "type": key,
                        "data": {
                            "static": False,
                            "obj": {
                                "id": component_value.id,
                            },
                            "element_id": element.id,
                        },
                    }
                )
    now = timezone.now()
    # date in format "2025-05-19T21:37:48.476Z"
    initial_data = {
        "date": now.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        "blocks": initial_data,
    }
    return json.dumps(initial_data)


class LessonsPageViewSet(BaseApiViewSet):
    search_fields = ["id"]
    ordering_fields = ["id", "order"]

    class LessonPageFilter(FilterSet):
        lesson_id = NumberFilter(field_name="lesson", lookup_expr="exact")

        class Meta:
            model = LessonPage
            fields = [
                "id",
                "lesson",
            ]

    filterset_class = LessonPageFilter

    def get_queryset(self):
        return LessonPage.objects.all()

    def get_serializer_class(self):
        return LessonPageSerializer

    def perform_create(self, serializer):
        kwargs = serializer.validated_data
        kwargs["order"] = LessonPage.objects.filter(lesson=kwargs["lesson"]).count() + 1
        return LessonPage.objects.create(**kwargs)

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        serializer = LessonPageReorderSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson_obj = serializer.validated_data.get("lesson_id")
        order_ids = serializer.validated_data.get("ordered_ids")
        lesson_pages = list(lesson_obj.pages.all())
        if len(lesson_pages) != len(order_ids):
            raise BaseActionException("Incorrect order_ids count")

        obj_list = []
        for order, page_id in enumerate(order_ids):
            found_page_obj = [page for page in lesson_pages if page.id == page_id]
            if not found_page_obj:
                return Response(
                    {"error": f"Page with id {page_id} not found in lesson pages"},
                    status=400,
                )
            found_page_obj[0].order = order + 1
            obj_list.append(found_page_obj[0])
        for order, obj in enumerate(obj_list):
            obj.save()
        return Response(LessonPageSerializer(obj_list, many=True).data)

    @action(detail=True, methods=["post"], url_path="get-editor")
    def get_editor(self, request, *args, **kwargs):
        lesson_page_obj = self.get_object()
        ctype = ContentType.objects.get_for_model(LessonPage)
        try:
            post_obj = Post.objects.get(
                content_type=ctype.id, object_id=lesson_page_obj.id
            )
        except Post.DoesNotExist:
            author = request.user
            title = (
                f"Post for Lesson Page {lesson_page_obj.id}` [#{lesson_page_obj.order}]"
            )
            post_obj = Post.objects.create(
                title=title,
                author=author,
                post_type="editor",
                content_type=ctype,
                object_id=lesson_page_obj.id,
                content=create_initial_lesson_editor_post_content(
                    lesson_page_obj, request
                ),
            )

        return Response(
            {
                "post": {
                    "id": post_obj.id,
                    "title": post_obj.title,
                }
            }
        )
