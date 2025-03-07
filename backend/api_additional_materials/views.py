from rest_framework.views import APIView
from rest_framework.request import Request

from api_additional_materials.serializers import *
from backend.global_function import success_with_text, error_with_text


class GetAdditionalLessonBatchWithoutComponentsView(APIView):
    def get(self, request: Request):
        all_lesson_batch = AdditionalLessonBatch.objects.all()
        serializer = AdditionalLessonBatchWithoutComponentsSerializer(all_lesson_batch, many=True)
        return success_with_text(serializer.data)


class GetAdditionalLessonView(APIView):
    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        if not isinstance(lesson_id, int):
            return error_with_text('lesson_id must be an integer')
        try:
            lesson = AdditionalLesson.objects.get(pk=lesson_id)
            serializer = AdditionalLessonSerializer(lesson)
            return success_with_text(serializer.data)
        except AdditionalLesson.DoesNotExist:
            return error_with_text('Lesson not found')
