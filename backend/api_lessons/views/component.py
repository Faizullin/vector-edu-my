from rest_framework.request import Request
from rest_framework.views import APIView
from api_lessons.models import *
from api_lessons.serializers import *
from api_lessons.serializers import *
from api_lessons.serializers.components_serializers import UserRecordAnswerSerializer
from backend.global_function import *


class BaseAnswerComponentView(APIView):
    def check_lesson(self, lesson, user):
        if lesson is None:
            raise ValidationError('this lesson is deprecated')

        if not lesson.is_available_for_user(user):
            raise ValidationError('Lesson is not available for user')


class AnswerFillTextComponentView(BaseAnswerComponentView):
    def post(self, request: Request):
        serializer = AnswerToFillTextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        for item in serializer.validated_data['lines']:
            line: FillTextLine = item['line_id']
            answer: str = item['answer']
            lesson = line.component.get_lesson()
            self.check_lesson(lesson=lesson, user=user)

            # delete previous answer if exists
            UserFillTextAnswer.objects.filter(user=user, line=line).delete()

            # create new answer
            UserFillTextAnswer.objects.create(user=user, line=line, answer=answer)

        return success_with_text('Answers added')


class AnswerMatchingComponentView(BaseAnswerComponentView):
    def post(self, request: Request):
        serializer = AnswerToMatchingComponentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        for item in serializer.validated_data['elements']:
            first_element = item['first_element_id']
            second_element = item['second_element_id']
            couple = second_element.second_element
            lesson = couple.component.get_lesson()
            # check if first_element belongs to same Component as second element
            if first_element.first_element.component != couple.component:
                return error_with_text('Not in same component, please use our app, instead of trying to call API omg')

            self.check_lesson(lesson=lesson, user=user)

            # delete previous answer if exists
            UserMatchingComponentElementCouple.objects.filter(user=user, couple=couple).delete()

            # create new answer
            UserMatchingComponentElementCouple.objects.create(user=user, couple=couple, first_element=first_element)

        return success_with_text('Answer added')


class AnswerPutInOrderComponentView(BaseAnswerComponentView):
    def post(self, request: Request):
        serializer = AnswerToPutInOrderComponentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        elements = serializer.validated_data['elements']

        for element in elements:
            lesson = element['element_id'].component.get_lesson()
            self.check_lesson(lesson=lesson, user=user)

            # delete previous answer if exists
            UserPutInOrderAnswer.objects.filter(user=user, element=element['element_id']).delete()

            # create new answer
            UserPutInOrderAnswer.objects.create(user=user, element=element['element_id'], order=element['order'])

        return success_with_text('Answer added')


class AnswerQuestionComponentView(BaseAnswerComponentView):
    def post(self, request: Request):
        serializer = AnswerToQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        answer: QuestionAnswer = serializer.validated_data['answer_id']
        lesson = answer.component.get_lesson()

        self.check_lesson(lesson=lesson, user=user)

        # delete previous answer if exists
        UserQuestionAnswer.objects.filter(user=user, answer=answer).delete()
        # create new answer
        UserQuestionAnswer.objects.create(user=user, answer=answer)

        return success_with_text('Answer added')


class AnswerRecordAudioComponentView(APIView):
    def post(self, request: Request):
        # if request data is not form, then rejectt
        try:
            data = request.data.dict()
        except AttributeError:
            return error_with_text('Request data is not form')
        user = request.user
        component = data.get('component_id', None)
        if component is None:
            return error_with_text('No component id provided')
        file = data.get('file', None)
        if file is None:
            return error_with_text('No file provided')

        component: RecordAudioComponent = RecordAudioComponent.objects.filter(id=component).first()
        if component is None:
            return error_with_text('Component does not exist')
        lesson = component.get_lesson()
        if lesson is None:
            return error_with_text('Lesson is deprecated')

        if not lesson.is_available_for_user(user):
            return error_with_text('Lesson is not available for user')

        previous_ans = UserRecordAudioComponent.objects.filter(user=user, component=component).first()
        if previous_ans:
            previous_ans.file.delete()
            previous_ans.delete()

        curr_ans = UserRecordAudioComponent.objects.create(user=user, component=component, file=file)
        return success_with_text(UserRecordAnswerSerializer(curr_ans).data)
