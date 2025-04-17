from django.contrib.auth import get_user_model
from rest_framework import serializers

from api_lessons.models import QuestionAnswer, QuestionComponent, AudioComponent, FillTextComponent, FillTextLine, \
    TextComponent, VideoComponent, RecordAudioComponent, PutInOrderComponent, PutInOrderComponentElement, \
    MatchingComponentElement, MatchingComponentElementCouple, MatchingComponent, ImageComponent, LessonPageElement
from lms.apps.posts.models import Post, Category, Tag
from lms.apps.resources.api.components_utils import COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT
from lms.apps.resources.utils import get_video_link_from_vimeo

User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "title", "term", "description", "created_at", "updated_at"]


class PostSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "category", "created_at", "updated_at", "publication_status", "meta_title"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.author:
            representation["author"] = PostAuthorSerializer(instance.author).data
        if instance.category:
            representation["category"] = CategorySerializer(instance.category).data
        return representation


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer()
    category = CategorySerializer()

    class Meta:
        model = Post
        fields = ["id", "title", "author", "category", "created_at", "updated_at", "publication_status", "meta_title"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "title", ]


########################################################################################################################
# Lesson Components
########################################################################################################################


class AudioComponentSerializer(serializers.ModelSerializer):
    audio = serializers.SerializerMethodField(read_only=True)
    audio_file = serializers.FileField(write_only=True)

    class Meta:
        model = AudioComponent
        fields = ['id', 'audio', "title", "audio_file"]

    def get_audio(self, obj: AudioComponent):
        if not obj.audio:
            return None
        return {
            "url": obj.audio.url,
        }

    def create(self, validated_data):
        new_audio = validated_data.get("audio_file", None)
        kwargs = {
            "title": validated_data.get("title"),
        }
        if new_audio is not None:
            kwargs["audio"] = new_audio
        new_obj = AudioComponent.objects.create(**kwargs)
        return new_obj

    def update(self, instance, validated_data):
        new_audio = validated_data.get("audio_file", None)
        instance.title = validated_data.get("title", instance.title)
        if new_audio is not None:
            if instance.audio:
                instance.audio.delete()
            instance.audio = new_audio
        instance.save()
        return instance


class FillTextLineSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = FillTextLine
        fields = ['id', 'text_before', 'answer', 'text_after', 'order', 'item_id']


class FillTextComponentSerializer(serializers.ModelSerializer):
    lines = FillTextLineSerializer(many=True)

    class Meta:
        model = FillTextComponent
        fields = ['id', 'title', "put_words", "lines"]


class ImageComponentSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)
    image_file = serializers.ImageField(write_only=True)

    class Meta:
        model = ImageComponent
        fields = ['id', 'description', 'image', 'image_file']

    def get_image(self, obj):
        if not obj.image:
            return None
        return {
            "url": obj.image.url,
        }

    def create(self, validated_data):
        new_image = validated_data.get("image_file", None)
        kwargs = {
            "description": validated_data.get("description"),
        }
        if new_image is not None:
            kwargs["image"] = new_image
        new_obj = ImageComponent.objects.create(**kwargs)
        return new_obj

    def update(self, instance, validated_data):
        new_image = validated_data.get("image_file", None)
        instance.description = validated_data.get("description", instance.description)
        if new_image is not None:
            if instance.image:
                instance.image.delete()
            instance.image = new_image
        instance.save()
        return instance


class MatchingComponentElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingComponentElement
        fields = ['id', 'text', 'image', ]


class MatchingComponentElementCoupleSerializer(serializers.ModelSerializer):
    first_element = MatchingComponentElementSerializer(many=False)
    second_element = MatchingComponentElementSerializer(many=False)

    class Meta:
        model = MatchingComponentElementCouple
        fields = ['id', 'first_element', 'second_element']


class MatchingComponentSerializer(serializers.ModelSerializer):
    element_couples = MatchingComponentElementCoupleSerializer(many=True)

    class Meta:
        model = MatchingComponent
        fields = ['id', 'title', "element_couples"]


class PutInOrderComponentElementSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = PutInOrderComponentElement
        fields = ['id', 'text', 'order', 'item_id']


class OrderComponentElementSerializer(serializers.ModelSerializer):
    elements = PutInOrderComponentElementSerializer(many=True)

    class Meta:
        model = PutInOrderComponent
        fields = ['id', 'title', 'elements']


class QuestionAnswerSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = QuestionAnswer
        fields = ['id', 'text', 'is_correct', 'item_id']


class QuestionComponentSerializer(serializers.ModelSerializer):
    answers = QuestionAnswerSerializer(many=True)

    class Meta:
        model = QuestionComponent
        fields = ['id', 'text', 'answers']


class RecordingComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordAudioComponent
        fields = ['id', 'title', "description", ]


class TextComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextComponent
        fields = ['id', 'title', 'text']


class VideoComponentSerializer(serializers.ModelSerializer):
    embedded_video_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = VideoComponent
        fields = ['id', 'description', 'video_url', 'embedded_video_url']

    def get_embedded_video_url(self, obj: VideoComponent):
        return get_video_link_from_vimeo(obj.video_url)


class LessonPageElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPageElement
        fields = ['id', 'order', ] + list(COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT.values())


class PageElementSubmitActionSerializer(serializers.Serializer):
    element_id = serializers.IntegerField(required=False, allow_null=True)
    mode = serializers.ChoiceField(choices=['new', 'edit'])
    component_id = serializers.IntegerField()
    component_type = serializers.CharField()


class BuildAndPublishPostActionSubmitSerializer(serializers.Serializer):
    elements = PageElementSubmitActionSerializer(many=True, write_only=True)


class HotUpdateActionParamsSerializer(serializers.Serializer):
    post_id = serializers.IntegerField(required=True)
    component_id = serializers.IntegerField(required=False, allow_null=True)
    component_type = serializers.CharField(required=True)
    mode = serializers.ChoiceField(choices=['new', 'edit'], required=True)

    def validate_post_id(self, value):
        try:
            post = Post.objects.get(pk=value)
        except Post.DoesNotExist:
            raise serializers.ValidationError("`post_id` is invalid")
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        mode = attrs.get('mode')
        component_id = attrs.get('component_id')
        if mode == 'edit' and not component_id:
            raise serializers.ValidationError("`component_id` is required when `mode` is 'edit'")
        return attrs


class LoadComponentsDataActionItemSubmitSerializer(serializers.Serializer):
    component_id = serializers.IntegerField()
    component_type = serializers.CharField()
    tool_block_id = serializers.CharField()


class LoadComponentsDataActionSubmitSerializer(serializers.Serializer):
    components = LoadComponentsDataActionItemSubmitSerializer(many=True, write_only=True)
