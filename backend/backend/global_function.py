import uuid

from django.utils.deconstruct import deconstructible
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler
from rest_framework import serializers


def error_with_text(text):
    return Response({'message': text}, status=status.HTTP_400_BAD_REQUEST)


def success_with_text(text):
    return Response({'message': text}, status=status.HTTP_200_OK)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, ValidationError):
        return error_with_text(exc.detail)

    return response


@deconstructible
class PathAndRename(object):
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{uuid.uuid4()}.{ext}'
        return f'{self.path}{filename}'


class UserContextNeededSerializer(serializers.Serializer):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        from api_users.models import UserModel

        if isinstance(user, UserModel):
            if not user.is_authenticated:
                raise Exception('User must be authenticated')
            self.user = user
        else:
            raise Exception('User context needed')


class ModelIntegerField(serializers.IntegerField):
    def __init__(self, source=None, model=None):
        super().__init__(allow_null=True, required=False, source=source)
        if model:
            self.model = model
        else:
            raise ValueError('ModelIntegerField: model is required')
        if not source:
            raise ValueError('ModelIntegerField: source is required')

    def get_instance(self, value: int):
        if type(value) == int:
            return self.model.objects.get(id=value)
        raise ValueError('HEY! value needs to be INT')


class NestedSupportedModelSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        this_class_data = {}
        many_serializers_data = {}
        single_serializers_data = {}
        for data_key in self.validated_data.keys():
            data_value = self.validated_data[data_key]
            field_value = self.fields.get(data_key)
            if isinstance(field_value, serializers.BaseSerializer):
                if isinstance(field_value, serializers.ListSerializer) and data_value is not None:
                    many_serializers_data[data_key] = data_value
                elif data_value is not None:
                    single_serializers_data[data_key] = data_value
            else:
                if isinstance(field_value, ModelIntegerField):
                    data_value = field_value.get_instance(data_value['id'])
                this_class_data[data_key] = data_value

        for key in single_serializers_data.keys():
            serializer = self.fields[key]
            serializer = serializer.__class__(data=single_serializers_data[key])

            if not serializer.is_valid():
                raise ValidationError(f'[S] Error in {key} field: {serializer.errors}')

            this_class_data[key] = serializer.save()

        this_class_instance = self.Meta.model(**this_class_data)
        this_class_instance.save()

        for key in many_serializers_data.keys():
            serializer = self.fields[key].child
            for data in many_serializers_data[key]:
                a = self.get_this_class_name_inside_another_serializer_fields(serializer)
                if a:
                    data[a] = this_class_instance.id
                a = serializer.__class__(data=data)
                if not a.is_valid():
                    raise ValidationError(f'[M] Error in {key} field: {a.errors}')
                a.save()

        return this_class_instance

    def get_this_class_name_inside_another_serializer_fields(self, other_serializer):
        """
        if returns None, then another class doesn't have this class in its fields
        """
        this_class_model = self.Meta.model
        if isinstance(other_serializer, serializers.ListSerializer):
            other_serializer = other_serializer

        for key in other_serializer.fields.keys():
            value = other_serializer.fields[key]
            if isinstance(value, ModelIntegerField):
                if value.model == this_class_model:
                    return key
        return None
