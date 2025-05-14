from rest_framework import status, permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from api_lessons.models import QuestionComponent, QuestionAnswer, \
    BlueCardComponent, AudioComponent, FillTextComponent, FillTextLine, VideoComponent, RecordAudioComponent, \
    PutInOrderComponent, PutInOrderComponentElement, ImageComponent, LessonPage, LessonPageElement, TextComponent, \
    MatchingComponent
from api_lessons.serializers.components_serializers import BlueCardComponentSerializer
from lms.apps.core.models import PublicationStatus
from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
from lms.apps.core.utils.crud_base.views import BaseListApiView, BaseApiViewSet
from lms.apps.editor.api.views import BaseContentEditorActionAPIView
from lms.apps.posts.models import Post, Tag, Category
from .components_utils import COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT, COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT
from .serializers import PostSerializer, TagSerializer, QuestionComponentSerializer, PostSubmitSerializer, \
    CategorySerializer, AudioComponentSerializer, FillTextComponentSerializer, \
    VideoComponentSerializer, RecordingComponentSerializer, OrderComponentElementSerializer, \
    LoadComponentsDataActionSubmitSerializer, ImageComponentSerializer, \
    BuildAndPublishPostActionSubmitSerializer, LessonPageElementSerializer, HotUpdateActionParamsSerializer, \
    TextComponentSerializer, MatchingComponentSerializer
    
from django_filters.rest_framework import FilterSet
from django_filters import CharFilter


class ResourcesPostViewSet(BaseApiViewSet):
    search_fields = ['title', ]
    
    class PostFilter(FilterSet):
        title = CharFilter(lookup_expr='icontains')

        class Meta:
            model = Post
            fields = ['id', 'title', "author", "publication_status"]
    filterset_class = PostFilter

    def get_queryset(self):
        return Post.objects.all().prefetch_related('author', 'category', 'thumbnail')

    def perform_create(self, serializer):
        return serializer.save(author=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ["POST", "PUT", "PATCH"]:
            return PostSubmitSerializer
        return PostSerializer

    @action(detail=True, methods=['post'], )
    def publish(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        self.check_object_permissions(request, post)
        post.publication_status = PublicationStatus.PUBLISH
        post.save()
        return Response({'detail': 'Post published successfully'}, status=status.HTTP_200_OK)


class TagListAPIView(BaseListApiView):
    serializer_class = TagSerializer
    search_fields = ['title']
    authentication_classes = [SessionAuthentication, ]

    def get_queryset(self):
        queryset = Tag.objects.all()
        return queryset


class ResourcesCategoryViewSet(BaseApiViewSet):
    search_fields = ['title']

    def get_queryset(self):
        return Category.objects.all()

    def get_serializer_class(self):
        return CategorySerializer


class ResourcesTextComponentViewSet(BaseApiViewSet):
    search_fields = ['title', "text"]

    def get_queryset(self):
        return TextComponent.objects.all()

    def get_serializer_class(self):
        return TextComponentSerializer


class ResourcesQuestionComponentViewSet(BaseApiViewSet):
    search_fields = ['text']

    def get_queryset(self):
        return QuestionComponent.objects.all().prefetch_related('answers')

    def get_serializer_class(self):
        return QuestionComponentSerializer

    def perform_create(self, serializer):
        q_obj = QuestionComponent.objects.create(
            text=serializer.validated_data.get('text')
        )
        for answer in serializer.validated_data.get('answers'):
            QuestionAnswer.objects.create(
                component=q_obj,
                text=answer.get('text'),
                is_correct=answer.get('is_correct')
            )
        return q_obj

    def perform_update(self, serializer):
        q_obj = serializer.instance
        q_obj.text = serializer.validated_data.get('text')
        q_obj.save()
        include_answers_list = []
        for answer in serializer.validated_data.get('answers'):
            obj, _ = QuestionAnswer.objects.update_or_create(
                id=answer.get('item_id'),
                defaults={
                    'text': answer.get('text'),
                    'is_correct': answer.get('is_correct'),
                    'component': q_obj,
                }
            )
            include_answers_list.append(obj)
        include_answers_ids_list = [i.id for i in include_answers_list]
        q_obj.answers.exclude(id__in=include_answers_ids_list).delete()
        return q_obj


class ResourcesBlueCardComponentViewSet(BaseApiViewSet):
    search_fields = ['text', ]

    def get_queryset(self):
        return BlueCardComponent.objects.all()

    def get_serializer_class(self):
        return BlueCardComponentSerializer


class ResourcesAudioComponentViewSet(BaseApiViewSet):
    search_fields = ['title', ]

    def get_queryset(self):
        return AudioComponent.objects.all()

    def get_serializer_class(self):
        return AudioComponentSerializer


class ResourceFillTextComponentViewSet(BaseApiViewSet):
    search_fields = ['title', ]

    def get_queryset(self):
        return FillTextComponent.objects.all().prefetch_related('lines')

    def get_serializer_class(self):
        return FillTextComponentSerializer

    def perform_create(self, serializer):
        f_obj = FillTextComponent.objects.create(
            title=serializer.validated_data.get('title'),
            put_words=serializer.validated_data.get('put_words')
        )
        for line in serializer.validated_data.get('lines'):
            FillTextLine.objects.create(
                component=f_obj,
                text_before=line.get('text_before'),
                answer=line.get('answer'),
                text_after=line.get('text_after'),
                order=line.get('order')
            )
        return f_obj

    def perform_update(self, serializer):
        f_obj = serializer.instance
        f_obj.title = serializer.validated_data.get('title')
        f_obj.put_words = serializer.validated_data.get('put_words')
        f_obj.save()
        include_lines_list = []
        for line in serializer.validated_data.get('lines'):
            obj, _ = FillTextLine.objects.update_or_create(
                id=line.get('item_id'),
                defaults={
                    'text_before': line.get('text_before'),
                    'answer': line.get('answer'),
                    'text_after': line.get('text_after'),
                    'order': line.get('order'),
                    'component': f_obj,
                }
            )
            include_lines_list.append(obj)
        include_lines_ids_list = [i.id for i in include_lines_list]
        f_obj.lines.exclude(id__in=include_lines_ids_list).delete()
        return f_obj


class ResourcesVideoComponentViewSet(BaseApiViewSet):
    search_fields = ['description', ]

    def get_queryset(self):
        return VideoComponent.objects.all()

    def get_serializer_class(self):
        return VideoComponentSerializer


class ResourcesOrderComponentViewSet(BaseApiViewSet):
    search_fields = ['title', ]

    def get_queryset(self):
        return PutInOrderComponent.objects.all().prefetch_related('elements')

    def get_serializer_class(self):
        return OrderComponentElementSerializer

    def perform_create(self, serializer):
        p_obj = PutInOrderComponent.objects.create(
            title=serializer.validated_data.get('title')
        )
        for element in serializer.validated_data.get('elements'):
            PutInOrderComponentElement.objects.create(
                component=p_obj,
                text=element.get('text'),
                order=element.get('order')
            )
        return p_obj

    def perform_update(self, serializer):
        p_obj = serializer.instance
        p_obj.title = serializer.validated_data.get('title')
        p_obj.save()
        include_elements_list = []
        for element in serializer.validated_data.get('elements'):
            obj, _ = PutInOrderComponentElement.objects.update_or_create(
                id=element.get('item_id'),
                defaults={
                    'text': element.get('text'),
                    'order': element.get('order'),
                    'component': p_obj,
                }
            )
            include_elements_list.append(obj)
        include_elements_ids_list = [i.id for i in include_elements_list]
        p_obj.elements.exclude(id__in=include_elements_ids_list).delete()
        return p_obj


class ResourcesRecordAudioComponentViewSet(BaseApiViewSet):
    search_fields = ['title', 'description', ]

    def get_queryset(self):
        return RecordAudioComponent.objects.all()

    def get_serializer_class(self):
        return RecordingComponentSerializer


class ResourcesImageComponentViewSet(BaseApiViewSet):
    search_fields = ['description', ]

    def get_queryset(self):
        return ImageComponent.objects.all()

    def get_serializer_class(self):
        return ImageComponentSerializer


class ResourcesMatchingComponentViewSet(BaseApiViewSet):
    search_fields = ['title', ]

    def get_queryset(self):
        return MatchingComponent.objects.all().prefetch_related('element_couples')

    def get_serializer_class(self):
        return MatchingComponentSerializer


class LoadContentAction(BaseAction):
    name = "load-content"

    def apply(self, request):
        post_id = request.GET.get('post_id', None)
        if post_id is None:
            raise BaseActionException("`post_id` is required")
        try:
            post_obj = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        json_instance_data = PostSerializer(post_obj).data
        json_instance_data["content_type"] = post_obj.content_type.model
        json_instance_data["object_id"] = post_obj.object_id
        return {
            "success": 1,
            "data": {
                "content": post_obj.content,
                "instance": json_instance_data,
            }
        }


class SaveContentAction(BaseAction):
    name = "save-content"

    def apply(self, request):
        post_id = request.GET.get('post_id', None)
        content = request.data.get('content', None)
        if post_id is None:
            raise BaseActionException("`post_id` is required")
        try:
            post_obj = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        post_obj.content = content
        post_obj.save()
        return {
            "success": 1,
            "data": {
                "content": post_obj.content,
                "instance": PostSerializer(post_obj).data,
            }
        }


def get_serializer_class_by_component_type(component_type):
    data_dict = {
        "question": QuestionComponentSerializer,
        "blue-card": BlueCardComponentSerializer,
        "audio": AudioComponentSerializer,
        "fill-text": FillTextComponentSerializer,
        "video": VideoComponentSerializer,
        "record-audio": RecordingComponentSerializer,
        "put-in-order": OrderComponentElementSerializer,
        "image": ImageComponentSerializer,
        "text": TextComponentSerializer,
    }
    return data_dict.get(component_type, None)


class HotUpdateComponentAction(BaseAction):
    name = "hot-update-component"

    def apply(self, request):
        serializer = HotUpdateActionParamsSerializer(data=request.GET)
        if not serializer.is_valid():
            raise BaseActionException(serializer.errors)
        component_type = serializer.validated_data['component_type']
        component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT[component_type]
        mode = serializer.validated_data['mode']
        component_id = serializer.validated_data.get('component_id')
        component_obj = None
        if mode == "edit":
            try:
                component_obj = component_class.objects.get(pk=component_id)
            except component_class.DoesNotExist:
                raise BaseActionException("`component_id` is invalid")
        elif mode == "new":
            component_obj = component_class()

        # do partial validation
        serializer = get_serializer_class_by_component_type(component_type)(component_obj, data=request.data,
                                                                            partial=True)
        if not serializer.is_valid():
            raise BaseActionException(serializer.errors)
        serializer.save()
        return {
            "success": 1,
            "data": {
                "instance": serializer.data,
            }
        }


class BuildAndPublishPostAction(BaseAction):
    name = "build-and-publish-post"

    def apply(self, request):
        post_id = request.GET.get('post_id', None)
        if post_id is None:
            raise BaseActionException("`post_id` is required")
        try:
            post_obj = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))

        if not post_obj.object_id:
            raise BaseActionException("Post object is not set")

        try:
            page_obj = LessonPage.objects.get(pk=post_obj.object_id)
        except LessonPage.DoesNotExist:
            raise BaseActionException("Incorrect connection between Lesson Page and Post Editor object")

        serializer = BuildAndPublishPostActionSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return {
                "success": 0,
                "errors": serializer.errors
            }
        validated_data = serializer.validated_data
        elements = validated_data.get('elements')
        els_data = []
        for i, element in enumerate(elements):
            mode = element.get('mode')
            element_id = element.get('element_id', None)
            component_id = element.get('component_id')
            component_type = element.get('component_type')
            component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(component_type)
            if component_class is None:
                raise BaseActionException("`component_type` is invalid")
            try:
                component_obj = component_class.objects.get(pk=component_id)
            except component_class.DoesNotExist:
                raise BaseActionException("`component_id` is invalid")
            field_name = COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT.get(component_type)
            obj_kwargs = {
                "page": page_obj,
                "order": i + 1,
                field_name: component_obj,
            }
            if mode == 'edit':
                if element_id is None:
                    raise BaseActionException("`element_id` is required for edit mode")
                obj_kwargs['id'] = element_id

            els_data.append(obj_kwargs)

        exclude_ids = [i.get('id') for i in els_data if i.get('id')]
        page_obj.elements.exclude(id__in=exclude_ids).delete()

        element_page_list = []
        for item in els_data:
            if item.get('id'):
                obj = LessonPageElement.objects.get(pk=item.get('id'))
                obj.page = item.get('page')
                obj.order = item.get('order')
                obj.save()
                element_page_list.append(obj)
            else:
                obj = LessonPageElement.objects.create(**item)
                element_page_list.append(obj)

        return {
            "success": 1,
            "data": {
                "instance": PostSerializer(post_obj).data,
                "elements": LessonPageElementSerializer(page_obj.elements.all(), many=True).data
            }
        }


class LoadComponentsDataAction(BaseAction):
    name = "load-components-data"

    def apply(self, request):
        serializer = LoadComponentsDataActionSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            raise BaseActionException(serializer.errors)
        validated_data = serializer.validated_data
        components = validated_data.get('components')
        response = []
        for component in components:
            component_id = component.get('component_id')
            component_type = component.get('component_type')
            component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(component_type)
            if component_class is None:
                raise BaseActionException("`component_type` is invalid")
            try:
                component_obj = component_class.objects.get(pk=component_id)
            except component_class.DoesNotExist:
                raise BaseActionException("`component_id` is invalid")
            response.append({
                "tool_block_id": component.get('tool_block_id'),
                "instance": get_serializer_class_by_component_type(component_type)(component_obj).data
            })
        return {
            "success": 1,
            "data": response
        }


class ResourcesPostEditContentActionAPIView(BaseContentEditorActionAPIView):
    permission_classes = (permissions.IsAuthenticated, permissions.IsAdminUser,)
    authentication_classes = [SessionAuthentication, ]

    available_get_actions = [
        LoadContentAction(),
    ]
    available_post_actions = [
        SaveContentAction(),
        HotUpdateComponentAction(),
        BuildAndPublishPostAction(),
        LoadComponentsDataAction(),
        # ComponentFormSubmitAction(),
        # BaseUploadImageByFileAction(),
    ]

    def get(self, request):
        action = request.GET.get('action', None)
        if action is None:
            return Response({'success': 0, "message": "`action` is required"}, status=status.HTTP_400_BAD_REQUEST)
        use_action = None
        for i in self.available_get_actions:
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
