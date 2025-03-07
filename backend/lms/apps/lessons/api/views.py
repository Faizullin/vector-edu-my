from django.db import transaction
from django_filters import CharFilter
from django_filters.rest_framework import FilterSet
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from api_lessons.models import Lesson, LessonPage
from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
from lms.apps.core.utils.crud_base.views import BaseListApiView
from .serializers import LessonSerializer, LessonPageSerializer, LessonPageBulkUpdateSubmitSerializer


##########################################################
# Lessons
# ########################################################

class LessonListAPIView(BaseListApiView):
    serializer_class = LessonSerializer
    search_fields = ['title', 'description']
    authentication_classes = [SessionAuthentication, ]
    ordering_fields = ['id', 'order']

    class LessonFilter(FilterSet):
        title = CharFilter(lookup_expr='icontains')

        class Meta:
            model = Lesson
            fields = ['id', 'title', ]

    filterset_class = LessonFilter

    def get_queryset(self):
        queryset = Lesson.objects.all()
        return queryset


##########################################################
# Lesson Pages
# ########################################################

class LessonPageListAPIView(BaseListApiView):
    serializer_class = LessonPageSerializer
    search_fields = []
    authentication_classes = [SessionAuthentication, ]
    ordering_fields = ['id', 'order']

    class LessonPageFilter(FilterSet):
        # lesson = IntFilter(lookup_expr='exact')

        class Meta:
            model = LessonPage
            fields = ['id', 'lesson', ]

    filterset_class = LessonPageFilter

    def get_queryset(self):
        queryset = LessonPage.objects.all()
        return queryset


##########################################################
# Lesson Actions
# ########################################################

class SaveOrderAction(BaseAction):
    name = "save-order"

    def apply(self, request):
        content_type = request.GET.get('content_type', None)
        if content_type is None:
            raise BaseActionException("Incorrect params for this action.")
        content_type = self.get_content_type_obj_from_model_name(content_type)
        available_models = [Lesson, LessonPage]

        print(available_models, content_type, content_type.model_class())
        if content_type.model_class() not in available_models:
            raise BaseActionException("`content_type` is invalid")

        order = request.POST.getlist('order[]')
        print(order)
        if not order:
            raise BaseActionException("`order` is required")

        model_class = content_type.model_class()
        items = model_class.objects.filter(id__in=order)
        if items.count() != len(order):
            raise BaseActionException("Some items do not exist")

        for index, item_id in enumerate(order):
            item = items.get(id=item_id)
            item.order = index
            item.save()

        return {
            "success": 1,
            "data": "Order updated successfully"
        }


class LessonPageAddAction(BaseAction):
    name = "lesson-page-add"

    def apply(self, request):
        lesson_id = request.data.get('lesson_id', None)
        if lesson_id is None:
            raise BaseActionException("`lesson_id` is required")
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if lesson is None:
            raise BaseActionException("`lesson` is invalid")
        lesson_page = LessonPage.objects.create(lesson=lesson, order=lesson.pages.count() + 1)
        return {
            "success": 1,
            "data": {
                "id": lesson_page.id,
                "lesson": lesson_page.lesson_id,
                "order": lesson_page.order,
            }
        }


class LessonPageReorder(BaseAction):
    name = "lesson-page-reorder"

    def apply(self, request):
        serializer = LessonPageBulkUpdateSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return {
                "success": 0,
                "errors": serializer.errors
            }
        lesson_obj = serializer.validated_data.get("lesson_id")
        changes = serializer.validated_data.get("changes")
        ids = [item["id"] for item in changes]
        order_map = {item["id"]: item["order"] for item in changes}
        items = lesson_obj.pages.filter(id__in=ids)
        if items.count() != len(changes):
            raise BaseActionException("Some items do not exist")
        with transaction.atomic():
            for page in items:
                page.order = order_map[page.id]
            LessonPage.objects.bulk_update(items, ["order"])
        return {
            "success": 1,
            "data": {
                "message": "Order updated successfully"
            }
        }


class LessonActionAPIView(APIView):
    authentication_classes = [SessionAuthentication, ]

    available_post_actions = [
        SaveOrderAction(),
        LessonPageAddAction(),
        LessonPageReorder(),
    ]

    def post(self, request):
        action = request.GET.get('action', None)
        if action is None:
            return Response({'success': 0, "message": "`action` is required"}, status=status.HTTP_400_BAD_REQUEST)
        use_action = None
        for i in self.available_post_actions:
            if i.name == action:
                use_action = i
                break
        if use_action is None:
            return Response({'success': 0, "message": "`action` is invalid"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            response = use_action.apply(request)
            return Response(response, status=status.HTTP_200_OK)
        except BaseActionException as e:
            return Response({'success': 0, 'message': str(e)}, status=e.status)
