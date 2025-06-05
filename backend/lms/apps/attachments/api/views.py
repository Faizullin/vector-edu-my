# from django.contrib.contenttypes.models import ContentType
# from django.core.exceptions import FieldDoesNotExist
# from django.db import models
# from django_filters import ModelChoiceFilter, NumberFilter
# from django_filters.rest_framework import DjangoFilterBackend, FilterSet
# from lms.apps.core.utils.crud_base.views import BaseApiView
# from rest_framework import generics, status, pagination
# from rest_framework.filters import SearchFilter, OrderingFilter
# from rest_framework.response import Response
# from rest_framework.views import APIView

# from lms.apps.attachments.models import Attachment
# from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
# from .serializers import BaseAttachmentSerializer, BaseAttachmentUploadSerializer
# from rest_framework.authentication import TokenAuthentication, SessionAuthentication



# class BaseCustomPagination(pagination.PageNumberPagination):
#     page_size = 10
#     page_size_query_param = "page_size"
#     max_page_size = 100


# class BaseAttachmentListAPIView(generics.ListAPIView):
#     serializer_class = BaseAttachmentSerializer
#     pagination_class = BaseCustomPagination
#     filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
#     search_fields = ["name", "id"]
#     ordering_fields = ["id", "created_at", "updated_at"]

#     authentication_classes = [
#         TokenAuthentication,
#     ]

#     class BaseAttachmentFilter(FilterSet):
#         content_type = ModelChoiceFilter(
#             field_name="content_type",
#             queryset=ContentType.objects.all(),
#             to_field_name="model",
#             label="Content Type",
#         )
#         NumberFilter(
#             field_name="object_id",
#             lookup_expr="exact",
#         )

#         class Meta:
#             model = Attachment
#             fields = ["id", "content_type", "object_id"]

#     filterset_class = BaseAttachmentFilter

#     def get_queryset(self):
#         queryset = Attachment.objects.all()
#         return queryset


# class BaseAttachmentUploadAPIView(BaseApiView):

#     def post(self, request):
#         serializer = BaseAttachmentUploadSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         content_type = serializer.validated_data["content_type"]
#         object_id = serializer.validated_data["object_id"]
#         to_model_field_name = serializer.validated_data.get("to_model_field_name", None)

#         model_class = content_type.model_class()
#         try:
#             related_obj = model_class.objects.get(pk=object_id)
#         except model_class.DoesNotExist:
#             return Response(
#                 {"error": "The related object does not exist."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         related_field = None
#         if serializer.validated_data["attachment_type"] == "thumbnail_image":
#             if not to_model_field_name:
#                 return Response(
#                     {"error": "`to_model_field_name` is required."},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )
#             try:
#                 related_field = model_class._meta.get_field(to_model_field_name)
#                 if not (isinstance(related_field, models.ForeignKey)):
#                     return Response(
#                         {"error": "`to_model_field_name` is not correct field"},
#                         status=status.HTTP_400_BAD_REQUEST,
#                     )
#             except FieldDoesNotExist:
#                 return Response(
#                     {"error": "`to_model_field_name` is not correct field"},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#         attachment_obj = Attachment.objects.create(
#             file=serializer.validated_data["file"],
#             content_type=serializer.validated_data["content_type"],
#             object_id=serializer.validated_data["object_id"],
#             attachment_type=serializer.validated_data["attachment_type"],
#         )
#         if related_field is not None:
#             setattr(related_obj, related_field.name, attachment_obj)
#             related_obj.save()
#         return Response(
#             BaseAttachmentSerializer(attachment_obj).data,
#             status=status.HTTP_201_CREATED,
#         )


# class BaseDetachRelatedAndDeleteSingleAction(BaseAction):
#     name = "detach_related_and_delete_single"

#     def apply(self, request):
#         obj_id = request.data.get("obj_id", None)
#         if not obj_id:
#             raise BaseActionException("obj_id is required")
#         try:
#             obj = Attachment.objects.get(pk=request.data.get("obj_id"))
#         except Attachment.DoesNotExist:
#             raise BaseActionException("Attachment with this obj_id does not exist")
#         to_model_field_name = request.data.get("to_model_field_name", None)
#         if not to_model_field_name:
#             raise BaseActionException("Incorrect params for this action.")
#         content_type, related_obj = self.get_content_type_obj_from_request(request)
#         try:
#             related_field = related_obj._meta.get_field(to_model_field_name)
#             if not (
#                 isinstance(related_field, models.ForeignKey)
#                 and related_field.related_model == Attachment
#             ):
#                 raise BaseActionException("`to_model_field_name` is not correct field")
#         except FieldDoesNotExist:
#             raise BaseActionException("`to_model_field_name` is not correct field")
#         setattr(related_obj, related_field.name, None)
#         related_obj.save()
#         obj.delete()
#         return {
#             "message": "Successfully saved content to {}.".format(related_obj),
#         }


# class BaseAttachRelatedSingleAction(BaseAction):
#     name = "attach_related_single"

#     def apply(self, request):
#         obj_id = request.data.get("obj_id", None)
#         if not obj_id:
#             raise BaseActionException("obj_id is required")
#         try:
#             obj = Attachment.objects.get(pk=request.data.get("obj_id"))
#         except Attachment.DoesNotExist:
#             raise BaseActionException("Attachment with this obj_id does not exist")
#         to_model_field_name = request.data.get("to_model_field_name", None)
#         if not to_model_field_name:
#             raise BaseActionException("Incorrect params for this action.")
#         content_type, related_obj = self.get_content_type_obj_from_request(request)
#         try:
#             related_field = related_obj._meta.get_field(to_model_field_name)
#             if not (
#                 isinstance(related_field, models.ForeignKey)
#                 and related_field.related_model == Attachment
#             ):
#                 raise BaseActionException("`to_model_field_name` is not correct field")
#         except FieldDoesNotExist:
#             raise BaseActionException("`to_model_field_name` is not correct field")
#         setattr(related_obj, related_field.name, obj)
#         related_obj.save()
#         return {
#             "message": "Successfully saved content to {}.".format(related_obj),
#         }


# class BaseDetachRelatedSingleAction(BaseAction):
#     name = "detach_related_single"

#     def apply(self, request):
#         to_model_field_name = request.data.get("to_model_field_name", None)
#         if not to_model_field_name:
#             raise BaseActionException("Incorrect params for this action.")
#         content_type, related_obj = self.get_content_type_obj_from_request(request)
#         try:
#             related_field = related_obj._meta.get_field(to_model_field_name)
#             if not (
#                 isinstance(related_field, models.ForeignKey)
#                 and related_field.related_model == Attachment
#             ):
#                 raise BaseActionException("`to_model_field_name` is not correct field")
#         except FieldDoesNotExist:
#             raise BaseActionException("`to_model_field_name` is not correct field")
#         setattr(related_obj, related_field.name, None)
#         related_obj.save()
#         return {
#             "message": "Successfully saved content to {}.".format(related_obj),
#         }


# class BaseDeleteSingleAction(BaseAction):
#     name = "delete_single"

#     def apply(self, request):
#         obj_id = request.data.get("obj_id", None)
#         if not obj_id:
#             raise BaseActionException("obj_id is required")
#         try:
#             obj = Attachment.objects.get(pk=request.data.get("obj_id"))
#         except Attachment.DoesNotExist:
#             raise BaseActionException("Attachment with this obj_id does not exist")
#         obj.delete()
#         return {
#             "message": "Successfully deleted.",
#         }


# class BaseAttachmentActionAPIView(BaseApiView):

#     def post(self, request, *args, **kwargs):
#         available_actions = [
#             BaseAttachRelatedSingleAction(),
#             BaseDetachRelatedSingleAction(),
#             BaseDetachRelatedAndDeleteSingleAction(),
#             BaseDeleteSingleAction(),
#         ]
#         action = request.data.get("action", None)
#         if action is None:
#             return Response(
#                 {"success": 0, "message": "`action` is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         for i in available_actions:
#             if i.name == action:
#                 try:
#                     response = i.apply(request)
#                     return Response(response, status=status.HTTP_200_OK)
#                 except BaseActionException as e:
#                     return Response({"success": 0, "message": str(e)}, status=e.status)
#         return Response(
#             {"success": 0, "message": "`action` is invalid"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )


# class AttachmentListAPIView(BaseAttachmentListAPIView):
#     pass


# class AttachmentUploadAPIView(BaseAttachmentUploadAPIView):
#     pass


# class AttachmentActionAPIView(BaseAttachmentActionAPIView):
#     pass
