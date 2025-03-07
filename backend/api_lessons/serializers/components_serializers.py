from api_lessons.models import *
from rest_framework import serializers
from backend.global_function import ModelIntegerField, NestedSupportedModelSerializer


class FillTextLineSerializer(NestedSupportedModelSerializer):
    component = ModelIntegerField(source='component.id', model=FillTextComponent)
    user_answer = serializers.SerializerMethodField()

    class Meta:
        model = FillTextLine
        fields = '__all__'

    def get_user_answer(self, obj):
        user_answer = UserFillTextAnswer.objects.filter(user=self.context['user'], line=obj).last()
        return user_answer.answer if user_answer else None


class AudioComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = AudioComponent
        fields = '__all__'


class UserRecordAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRecordAudioComponent
        fields = ['file', 'teacher_comment']


class RecordAudioComponentSerializer(NestedSupportedModelSerializer):
    user_answer = serializers.SerializerMethodField()

    class Meta:
        model = RecordAudioComponent
        fields = '__all__'

    def get_user_answer(self, obj):
        user_answer = UserRecordAudioComponent.objects.filter(user=self.context['user'], component=obj).first()
        return UserRecordAnswerSerializer(user_answer).data if user_answer else None


class PutInOrderComponentElementSerializer(NestedSupportedModelSerializer):
    component = ModelIntegerField(source='component.id', model=PutInOrderComponent)
    user_answer = serializers.SerializerMethodField()

    class Meta:
        model = PutInOrderComponentElement
        fields = '__all__'

    def get_user_answer(self, obj):
        user_answer = UserPutInOrderAnswer.objects.filter(user=self.context['user'], element=obj).first()
        return user_answer.order if user_answer else None


class MatchingComponentElementSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = MatchingComponentElement
        fields = '__all__'


class TextComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = TextComponent
        fields = '__all__'


class VideoComponentSerializer(NestedSupportedModelSerializer):
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoComponent
        fields = '__all__'

    def get_video_url(self, obj):
        return get_video_link_from_vimeo(obj.video_url)


class QuestionAnswerSerializer(NestedSupportedModelSerializer):
    question = ModelIntegerField(source='question.id', model=QuestionComponent)
    pressed = serializers.SerializerMethodField()

    class Meta:
        model = QuestionAnswer
        fields = '__all__'

    def get_pressed(self, obj):
        user_answer = UserQuestionAnswer.objects.filter(user=self.context['user'], answer=obj).first()
        return user_answer is not None


class BlueCardComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = BlueCardComponent
        fields = '__all__'


class ImageComponentSerializer(NestedSupportedModelSerializer):
    class Meta:
        model = ImageComponent
        fields = '__all__'


class MatchingComponentElementCoupleSerializer(NestedSupportedModelSerializer):
    first_element = MatchingComponentElementSerializer(many=False)
    second_element = MatchingComponentElementSerializer(many=False)
    component = ModelIntegerField(source='component.id', model=MatchingComponent)
    user_first_element_id = serializers.SerializerMethodField()

    class Meta:
        model = MatchingComponentElementCouple
        fields = '__all__'

    def get_user_first_element_id(self, obj):
        user_answer = UserMatchingComponentElementCouple.objects.filter(user=self.context['user'], couple=obj).last()
        return user_answer.first_element.id if user_answer else None


class MatchingComponentSerializer(NestedSupportedModelSerializer):
    element_couples = MatchingComponentElementCoupleSerializer(many=True)

    class Meta:
        model = MatchingComponent
        fields = '__all__'


class FillTextComponentSerializer(NestedSupportedModelSerializer):
    lines = FillTextLineSerializer(many=True)

    class Meta:
        model = FillTextComponent
        fields = '__all__'


class PutInOrderComponentSerializer(NestedSupportedModelSerializer):
    elements = PutInOrderComponentElementSerializer(many=True)

    class Meta:
        model = PutInOrderComponent
        fields = '__all__'


class QuestionComponentSerializer(NestedSupportedModelSerializer):
    answers = QuestionAnswerSerializer(many=True)

    class Meta:
        model = QuestionComponent
        fields = '__all__'


class LessonPageElementSerializer(NestedSupportedModelSerializer):
    blue_card_component = BlueCardComponentSerializer(many=False, allow_null=True, required=False)
    audio_component = AudioComponentSerializer(many=False, allow_null=True, required=False)
    matching_component = MatchingComponentSerializer(many=False, allow_null=True, required=False)
    record_audio_component = RecordAudioComponentSerializer(many=False, allow_null=True, required=False)
    video_component = VideoComponentSerializer(many=False, allow_null=True, required=False)
    put_in_order_component = PutInOrderComponentSerializer(many=False, allow_null=True, required=False)
    text_component = TextComponentSerializer(many=False, allow_null=True, required=False)
    fill_text_component = FillTextComponentSerializer(many=False, allow_null=True, required=False)
    question_component = QuestionComponentSerializer(many=False, allow_null=True, required=False)
    image_component = ImageComponentSerializer(many=False, allow_null=True, required=False)

    page = ModelIntegerField(source='page.id', model=LessonPage)

    class Meta:
        model = LessonPageElement
        fields = '__all__'


class LessonPageSerializer(NestedSupportedModelSerializer):
    elements = LessonPageElementSerializer(many=True)
    lesson = ModelIntegerField(source='lesson.id', model=Lesson)

    class Meta:
        model = LessonPage
        fields = '__all__'
