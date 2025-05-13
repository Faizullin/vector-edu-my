import json
from api_lessons.models.lesson_components.__component_base import LessonPage
from api_lessons.models.lesson_components.__page_element import LessonPageElement
from api_lessons.serializers.components_serializers import LessonPageSerializer
from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
from lms.apps.editor.api.views import BaseContentEditorActionAPIView
from lms.apps.posts.models import Post
from lms.apps.resources.api.components_utils import COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT, COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT
from .serializers import (
    BasePostEditSerializer,
    BuildAndPublishContentSerializer,
    PostSerializer,
    SaveContentSerializer,
)
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication


class ActionRequestException(BaseActionException):
    def __init__(self, message: dict | str, status_code=400):
        super().__init__(message, status_code)
        self.status_code = status_code


class LoadContentAction(BaseAction):
    name = "load-content"

    def apply(self, request):
        serializer = BasePostEditSerializer(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        try:
            post_obj = Post.objects.get(pk=serializer.validated_data["post_id"])
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
            },
        }


class SaveContentAction(BaseAction):
    name = "save-content"

    def apply(self, request):
        serializer = SaveContentSerializer(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        try:
            post_obj = Post.objects.get(pk=serializer.validated_data["post_id"])
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        post_obj.content = serializer.validated_data["content"]
        post_obj.save()
        return {
            "success": 1,
            "data": {
                "content": post_obj.content,
                "instance": PostSerializer(post_obj).data,
            },
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


class LoadDemoLessonDataAction(BaseAction):
    name = "load-demo-lesson-data"

    def apply(self, request):
        serializer = BasePostEditSerializer(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        try:
            post_obj = Post.objects.get(pk=serializer.validated_data["post_id"])
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        LessonPageModel = post_obj.content_type.model_class()
        try:
            lesson_page_obj = LessonPageModel.objects.get(pk=post_obj.object_id)
        except LessonPageModel.DoesNotExist:
            raise BaseActionException("`object_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        lesson_page_serializer = LessonPageSerializer(lesson_page_obj)
        return {
            "success": 1,
            "data": {
                "lesson_page": lesson_page_serializer.data,
            },
        }


class BuildAndPublishContentAction(BaseAction):
    name = "build-and-publish-content"

    def apply(self, request):
        serializer = BuildAndPublishContentSerializer(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        try:
            post_obj = Post.objects.get(pk=serializer.validated_data["post_id"])
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        if not post_obj.object_id:
            raise BaseActionException("Post object is not set")
        try:
            page_obj = LessonPage.objects.get(pk=post_obj.object_id)
        except LessonPage.DoesNotExist:
            raise BaseActionException(
                "Incorrect connection between Lesson Page and Post Editor object"
            )
        formatted_content = serializer.validated_data["content"].strip()
        try:
            formatted_content = json.loads(formatted_content)
        except json.JSONDecodeError:
            raise BaseActionException("`content` is not a valid JSON string")
        print("formatted_content", formatted_content)
        els_data = []
        new_formatted_content_data = []
        for index, i in enumerate(formatted_content):
            i_data = i.get("props").get("data")
            i_data_obj = i_data.get("obj", None)
            i_data_obj_values = i_data.get("values", None)
            i_block_id = i.get("id")
            i_type = i.get("type")
            i_data_staticNotEditable = i_data.get("staticNotEditable", False)
            component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(i_type)
            if component_class is None:
                raise BaseActionException("item `type` is invalid")
            field_name = COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT.get(i_type)
            obj_kwargs = {
                "page": page_obj,
                "order": index + 1,
            }
            component_obj = component_class(**obj_kwargs)
            if i_data_obj is None:
                if i_data_obj_values is None:
                    raise BaseActionException("`obj` or `values` is required")
                component_serializer = get_serializer_class_by_component_type(i_type)(
                    data=i_data_obj_values, partial=True
                )
                if not component_serializer.is_valid():
                    raise ActionRequestException({
                        "errors": component_serializer.errors,
                        "block_id": i_block_id,
                        "component_type": i_type,
                    })
                component_obj = component_serializer.save()
                obj_kwargs[field_name] = component_obj
            else:
                if i_data_staticNotEditable:
                    try:
                        component_obj = component_class.objects.get(
                            pk=i_data_obj.get("id")
                        )
                    except component_class.DoesNotExist:
                        raise BaseActionException("`component_id` is invalid for staticNotEditable")
                else:
                    component_serializer = get_serializer_class_by_component_type(i_type)(
                        data=i_data_obj, partial=True
                    )
                    if not component_serializer.is_valid():
                        raise ActionRequestException({
                            "errors": component_serializer.errors,
                            "block_id": i_block_id,
                            "component_type": i_type,
                        })
                    component_obj = component_serializer.save()
                    obj_kwargs[field_name] = component_obj
            els_data.append(obj_kwargs)  
            new_i_ = i.copy()
            if component_obj:
                new_i_["props"]["data"]["obj"] = component_serializer.data
            new_content.append(new_i_)

        print("new_content", new_content)

        page_obj.elements.delete()
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

        print("element_page_list", element_page_list)

        new_content = []
        for i in formatted_content:
            i_data = i.get("props").get("data")
            i_data_obj = i_data.get("obj", None)
            i_data_obj_values = i_data.get("values", None)
            i_block_id = i.get("id")
            i_type = i.get("type")
            if i_data_obj is None:
                if i_data_obj_values is None:
                    raise BaseActionException("`obj` or `values` is required")
                component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(i_type)
            
        return {
            "success": 1,
            "data": {
                "elments": element_page_list,
            },
        }
        
        els_data = []
        for i, element in enumerate(elements):
            mode = element.get("mode")
            element_id = element.get("element_id", None)
            component_id = element.get("component_id")
            component_type = element.get("component_type")
            component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(
                component_type
            )
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
            if mode == "edit":
                if element_id is None:
                    raise BaseActionException("`element_id` is required for edit mode")
                obj_kwargs["id"] = element_id

            els_data.append(obj_kwargs)

        exclude_ids = [i.get("id") for i in els_data if i.get("id")]
        page_obj.elements.exclude(id__in=exclude_ids).delete()

        element_page_list = []
        for item in els_data:
            if item.get("id"):
                obj = LessonPageElement.objects.get(pk=item.get("id"))
                obj.page = item.get("page")
                obj.order = item.get("order")
                obj.save()
                element_page_list.append(obj)
            else:
                obj = LessonPageElement.objects.create(**item)
                element_page_list.append(obj)

        return {
            "success": 1,
            "data": {
                "instance": PostSerializer(post_obj).data,
                "elements": LessonPageElementSerializer(
                    page_obj.elements.all(), many=True
                ).data,
            },
        }


# class LoadComponentsDataAction(BaseAction):
#     name = "load-components-data"

#     def apply(self, request):
#         serializer = LoadComponentsDataActionSubmitSerializer(data=request.data)
#         if not serializer.is_valid():
#             raise BaseActionException(serializer.errors)
#         validated_data = serializer.validated_data
#         components = validated_data.get('components')
#         response = []
#         for component in components:
#             component_id = component.get('component_id')
#             component_type = component.get('component_type')
#             component_class = COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT.get(component_type)
#             if component_class is None:
#                 raise BaseActionException("`component_type` is invalid")
#             try:
#                 component_obj = component_class.objects.get(pk=component_id)
#             except component_class.DoesNotExist:
#                 raise BaseActionException("`component_id` is invalid")
#             response.append({
#                 "tool_block_id": component.get('tool_block_id'),
#                 "instance": get_serializer_class_by_component_type(component_type)(component_obj).data
#             })
#         return {
#             "success": 1,
#             "data": response
#         }


class ResourcesPostEditContentActionAPIView(BaseContentEditorActionAPIView):
    permission_classes = (
        permissions.IsAuthenticated,
        permissions.IsAdminUser,
    )

    available_get_actions = []
    available_post_actions = [
        LoadContentAction(),
        SaveContentAction(),
        LoadDemoLessonDataAction(),
        # HotUpdateComponentAction(),
        BuildAndPublishContentAction(),
        # LoadComponentsDataAction(),
        # ComponentFormSubmitAction(),
        # BaseUploadImageByFileAction(),
    ]

    def post(self, request):
        action = request.GET.get("action", None)
        if action is None:
            return Response(
                {"success": 0, "message": "`action` is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        use_action = None
        for i in self.available_post_actions:
            if i.name == action:
                use_action = i
                break
        if use_action is None:
            return Response(
                {"success": 0, "message": "`action` is invalid"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            response = use_action.apply(request)
            return Response(response, status=status.HTTP_200_OK)
        except BaseActionException as e:
            return Response({"success": 0, "message": str(e)}, status=e.status)
