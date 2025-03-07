from django.utils.translation import get_language_from_request
from parler_rest.serializers import TranslatedFieldsField
from rest_framework import serializers

from .models import AbstractTimestampedModel


def get_datetime_formatted(value) -> str:
    return value.strftime('%Y-%m-%d %H:%M:%S')


class TimestampedSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField(read_only=True)
    updated_at = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AbstractTimestampedModel
        fields = ['created_at', 'updated_at']

    def get_created_at(self, obj):
        return get_datetime_formatted(obj.created_at)

    def get_updated_at(self, obj):
        return get_datetime_formatted(obj.updated_at)

    def get_file_build(self, file):
        request = self.context.get('request')
        return request.build_absolute_uri(file.url) if file else ""


class ImageWRField(serializers.ImageField):
    def to_representation(self, value):
        if not value:
            return ""
        request = self.context.get('request')
        return request.build_absolute_uri(value.url)


class CTranslatedFieldsField(TranslatedFieldsField):
    def get_value(self, dictionary):
        related_name = self.source or self.field_name
        fields = self.shared_model._parler_meta[related_name].get_translated_fields(
        )
        lang = self.context.get('request').query_params.get('lang', None)
        lang = lang if lang is not None else get_language_from_request(self.context['request'])
        values = dict()
        partial = getattr(self.root, 'partial', False)
        for f in fields:
            if f not in dictionary:
                if not partial:
                    values[f] = dictionary.get(f)
            else:
                values[f] = dictionary.get(f)
        if len(values.keys()) > 0:
            new_initital_data = dict()
            new_initital_data[lang] = values
        else:
            new_initital_data = serializers.empty
        return new_initital_data
