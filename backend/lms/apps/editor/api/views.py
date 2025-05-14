from django.core.exceptions import FieldDoesNotExist
from django.db import models
from lms.apps.core.utils.crud_base.views import BaseApiView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from lms.apps.core.utils.api_actions import BaseAction, BaseActionException

from lms.apps.attachments.models import Attachment

from rest_framework.authentication import SessionAuthentication


class BaseUploadImageByFileAction(BaseAction):
    name = "image-upload-by-file"

    def apply(self, request):
        the_file = request.FILES.get("file", None)
        if not the_file:
            raise BaseActionException("file is required")
        allowed_types = [
            "image/jpeg",
            "image/jpg",
            "image/pjpeg",
            "image/x-png",
            "image/png",
            "image/webp",
            "image/gif",
        ]
        if the_file.content_type not in allowed_types:
            return BaseActionException("You can only upload images.")
        content_type, related_obj = self.get_content_type_obj_from_request(request)
        attachment_obj = Attachment.objects.create(
            file=the_file,
            content_type=content_type,
            object_id=related_obj.pk,
            attachment_type="content-image",
        )
        return {
            "success": 1,
            "file": {
                "url": attachment_obj.file.url,
            },
        }


class BaseSaveContentAction(BaseAction):
    name = "save-content"

    def apply(self, request):
        to_model_field_name = request.data.get("to_model_field_name", None)
        content = request.data.get("content", None)
        if not to_model_field_name:
            raise BaseActionException("Incorrect params for this action.")
        if not content:
            raise BaseActionException("Incorrect params for this action.")
        content_type, related_obj = self.get_content_type_obj_from_request(request)
        try:
            related_field = related_obj._meta.get_field(to_model_field_name)
            if not (isinstance(related_field, models.TextField)):
                raise BaseActionException("`to_model_field_name` is not correct field")
        except FieldDoesNotExist:
            raise BaseActionException("`to_model_field_name` is not correct field")
        if related_field is not None:
            setattr(related_obj, related_field.name, content)
            related_obj.save()
        return {
            "message": "Successfully saved content to {}.".format(related_obj),
        }


class BaseContentEditorActionAPIView(BaseApiView):

    def post(self, request):
        available_actions = [
            BaseUploadImageByFileAction(),
            BaseSaveContentAction(),
        ]
        action = request.data.get("action", None)
        if action is None:
            return Response(
                {"success": 0, "message": "`action` is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for i in available_actions:
            if i.name == action:
                try:
                    response = i.apply(request)
                    return Response(response, status=status.HTTP_200_OK)
                except BaseActionException as e:
                    return Response({"success": 0, "message": str(e)}, status=e.status)
        return Response(
            {"success": 0, "message": "`action` is invalid"},
            status=status.HTTP_400_BAD_REQUEST,
        )
