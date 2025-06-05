import json
from lms.apps.core.models import PublicationStatus
from lms.apps.attachments.api.serializers import BaseAttachmentSerializer
from lms.apps.attachments.models import Attachment
from rest_framework import status
from rest_framework.response import Response
from lms.apps.core.utils.api_actions import (
    BaseAction,
    BaseActionException,
    ActionRequestException,
)
from lms.apps.core.utils.crud_base.views import BaseApiView
from lms.apps.posts.models import Post
from .serializers import (
    BasePostEditSerializer,
    BuildAndPublishContentSerializer,
    FileControlSerializer,
    LoadComponentObjDataSerializer,
    PostSerializer,
    SaveContentSerializer,
)
from lms.apps.lessons.models import TemplateComponent, LessonPage
from .serializers import FileControlActionChoices, TemplateComponentSerializer


class EditorPostActionBase(BaseAction):
    def validate_serializer(
        self, request, serializer_class=BasePostEditSerializer, use_post_query=True
    ):
        serializer = serializer_class(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        return serializer

    def validate_and_get_post(self, post_id) -> Post:
        try:
            post_obj = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        if post_obj.post_type != "editor3":
            raise BaseActionException(
                "`post_id` does not refer to a valid post for the editor"
            )
        return post_obj

    def validate_and_get_page(self, post_obj: Post) -> LessonPage:
        LessonPageModel = post_obj.content_type.model_class()
        if LessonPageModel != LessonPage:
            raise BaseActionException(
                "`content_type` does not refer to a valid lesson page model"
            )
        try:
            page_obj = LessonPage.objects.get(pk=post_obj.object_id)
        except LessonPage.DoesNotExist:
            raise BaseActionException("`object_id` is invalid")
        except Exception as e:
            raise BaseActionException(str(e))
        return page_obj


class LoadContentAction(EditorPostActionBase):
    name = "load-content"

    def apply(self, request):
        serializer = self.validate_serializer(request)
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        page_obj = self.validate_and_get_page(post_obj)
        json_instance_data = PostSerializer(post_obj).data
        json_instance_data["content_type"] = page_obj._meta.model_name
        json_instance_data["object_id"] = post_obj.object_id
        return {
            "success": 1,
            "data": {
                "message": "Content loaded successfully",
                "content": post_obj.content,
                "instance": json_instance_data,
            },
        }


class SaveContentAction(EditorPostActionBase):
    name = "save-content"

    def apply(self, request):
        serializer = SaveContentSerializer(data=request.data)
        if not serializer.is_valid():
            raise ActionRequestException(serializer.errors)
        try:
            post_obj = Post.objects.get(pk=serializer.validated_data["post_id"])
        except Post.DoesNotExist:
            raise BaseActionException("`post_id` is invalid")
        serializer = self.validate_serializer(
            request, serializer_class=SaveContentSerializer
        )
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        page_obj = self.validate_and_get_page(post_obj)
        post_obj.content = serializer.validated_data["content"]
        post_obj.save()
        json_instance_data = PostSerializer(post_obj).data
        json_instance_data["content_type"] = page_obj._meta.model_name
        json_instance_data["object_id"] = post_obj.object_id
        return {
            "success": 1,
            "data": {
                "message": "Content saved successfully",
                "content": post_obj.content,
                "instance": json_instance_data,
            },
        }


class LoadDemoLessonDataAction(EditorPostActionBase):
    name = "load-demo-lesson-data"

    def apply(self, request):
        serializer = self.validate_serializer(request)
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        page_obj = self.validate_and_get_page(post_obj)
        lesson_page_data = {
            "id": page_obj.pk,
            "order": page_obj.order,
            "title": page_obj.title,
            "content": page_obj.content,
        }
        return {
            "success": 1,
            "data": {
                "message": "Demo lesson data loaded successfully",
                "lesson_page": lesson_page_data,
            },
        }


class BuildAndPublishContentAction(EditorPostActionBase):
    name = "build-and-publish-content"

    def apply(self, request):
        serializer = self.validate_serializer(
            request, serializer_class=BuildAndPublishContentSerializer
        )
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        page_obj = self.validate_and_get_page(post_obj)
        post_obj.publication_status = serializer.validated_data["publication_status"]
        post_obj.save()
        lesson_page_public_post_obj, created = Post.objects.get_or_create(
            content_type=page_obj._meta.model_name,
            object_id=page_obj.pk,
            post_type="lesson-page-public",
            defaults={
                "title": post_obj.title,
                "author": post_obj.author,
                "category": post_obj.category,
                "publication_status": post_obj.publication_status,
                "content": post_obj.content,
            },
        )
        lesson_page_public_post_obj.content = post_obj.content
        lesson_page_public_post_obj.title = post_obj.title
        lesson_page_public_post_obj.save()
        return {
            "success": 1,
            "data": {
                "message": "Content built and published successfully",
                "instance": PostSerializer(post_obj).data,
                "content": post_obj.content,
            },
        }


class LoadContentObjDataAction(EditorPostActionBase):
    name = "load-content-obj-data"

    def apply(self, request):
        serializer = self.validate_serializer(
            request, serializer_class=LoadComponentObjDataSerializer
        )
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        self.validate_and_get_page(post_obj)
        component_class_dict = {
            "template": TemplateComponent,
        }
        component_serializer_dict = {
            "template": TemplateComponentSerializer,
        }
        items_data = []
        for i in serializer.validated_data["items"]:
            component_type = i.get("component_type")
            object_id = i.get("object_id")
            if component_type not in component_class_dict:
                raise BaseActionException(
                    f"`component_type` {component_type} is invalid"
                )
            items_data.append(
                {
                    "component_type": component_type,
                    "object_id": object_id,
                    "component_class": component_class_dict[component_type],
                }
            )
        items_response_data = []
        for i in items_data:
            component_class = i.get("component_class")
            object_id = i.get("object_id")
            try:
                component_obj = component_class.objects.get(pk=object_id)
            except component_class.DoesNotExist:
                raise BaseActionException("`object_id` is invalid")
            except Exception as e:
                raise BaseActionException(str(e))
            i_serializer_class = component_serializer_dict.get(i.get("component_type"))(
                instance=component_obj
            )
            items_response_data.append(
                {
                    "component_type": i.get("component_type"),
                    "object_id": object_id,
                    "component_data": i_serializer_class.data,
                }
            )
        return {
            "success": 1,
            "data": {
                "message": "Content object data loaded successfully",
                "items": items_response_data,
            },
        }


class FileControlAction(EditorPostActionBase):
    name = "file-control"

    def apply(self, request):
        serializer = self.validate_serializer(
            request, serializer_class=FileControlSerializer
        )
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        self.validate_and_get_page(post_obj)
        file_action_name = serializer.validated_data["file_action"]
        if file_action_name == FileControlActionChoices.UPLOAD:
            new_attachment_obj = Attachment.objects.create(
                file=serializer.validated_data["file"],
                content_type=post_obj._meta.model_name,
                object_id=post_obj.pk,
                attachment_type="file",
                storage_engine="protected-local",
            )
            new_attachment_obj.save()
            return {
                "success": 1,
                "data": {
                    "message": "File uploaded successfully",
                    "component_data": BaseAttachmentSerializer(new_attachment_obj).data,
                },
            }
        elif file_action_name == FileControlActionChoices.REMOVE:
            try:
                existing_attachment_obj = Attachment.objects.get(
                    pk=serializer.validated_data["attachment_id"],
                )
                if existing_attachment_obj.content_type != post_obj._meta.model_name:
                    raise BaseActionException(
                        "`attachment_id` does not refer to a valid attachment for the post"
                    )
            except Attachment.DoesNotExist:
                raise BaseActionException("`attachment_id` is invalid")
            except Exception as e:
                raise BaseActionException(str(e))
            existing_attachment_obj.delete()
            return {
                "success": 1,
                "data": {
                    "message": "File removed successfully",
                },
            }




class LoadAttachmentsMediaAction(EditorPostActionBase):
    name = "load-attachments-media"

    def apply(self, request):
        serializer = self.validate_serializer(request)
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        self.validate_and_get_page(post_obj)
        attachments = Attachment.objects.filter(
            content_type=post_obj._meta.model_name,
            object_id=post_obj.pk,
        )
        attachments_data = BaseAttachmentSerializer(attachments, many=True).data
        return {
            "success": 1,
            "data": {
                "message": "Attachments media loaded successfully",
                "attachments": attachments_data,
            },
        }


class DestroyPostEditorAction(EditorPostActionBase):
    name = "destroy-post-editor"

    def apply(self, request):
        serializer = self.validate_serializer(request)
        post_obj = self.validate_and_get_post(serializer.validated_data["post_id"])
        self.validate_and_get_page(post_obj)
        if post_obj.publication_status == PublicationStatus.PUBLISH:
            raise BaseActionException(
                "Cannot delete a published post. Please unpublish it first."
            )
        if post_obj.author != request.user:
            raise BaseActionException("You do not have permission to delete this post.")
        attachments = Attachment.objects.filter(
            content_type=post_obj._meta.model_name,
            object_id=post_obj.pk,
        )
        attachments.delete()
        try:
            post_obj = Post.objects.get(
                content_type=post_obj._meta.model_name,
                object_id=post_obj.pk,
                post_type="lesson-page-public",
            )
            post_obj.publication_status = PublicationStatus.DRAFT
            post_obj.save()
        except Post.DoesNotExist:
            pass
        post_obj.delete()
        return {
            "success": 1,
            "data": {
                "message": "Editor Post Post deleted successfully",
            },
        }


class LessonPageEditPostActionAPIView(BaseApiView):
    available_post_actions = [
        LoadContentAction(),
        SaveContentAction(),
        LoadDemoLessonDataAction(),
        LoadContentObjDataAction(),
        BuildAndPublishContentAction(),
        FileControlAction(),
        LoadAttachmentsMediaAction(),
        DestroyPostEditorAction(),
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
        except ActionRequestException as err:
            return Response(
                {
                    "success": 0,
                    "errors": {
                        "message": str(err),
                        "errors": err.errors,
                    },
                }
            )
        except BaseActionException as err:
            return Response({"success": 0, "message": str(err)}, status=err.status)
