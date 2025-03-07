from django.contrib.contenttypes.models import ContentType
from django.core.files.images import get_image_dimensions
from rest_framework import serializers


from lms.apps.attachments.models import Attachment



class BaseAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id", "attachment_type", "content_type", "object_id", "name", "extension", "alt", "url", "size",
            "file_type",
            "file")


class BaseAttachmentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model',
    )
    object_id = serializers.IntegerField()
    attachment_type = serializers.ChoiceField(choices=[('thumbnail_image', 'Thumbnail'), ('file', 'File')])
    to_model_field_name = serializers.CharField(required=False, default=None)

    def validate(self, data):
        attachment_type = data.get('attachment_type')
        file = data.get('file')
        if attachment_type == 'thumbnail_image':
            if not file.content_type.startswith('image/'):
                raise serializers.ValidationError("File must be an image for thumbnail attachment type.")

            max_size = 5 * 1024 * 1024  # 5 MB
            if file.size > max_size:
                raise serializers.ValidationError(
                    f"Image size exceeds the maximum limit of {max_size / (1024 * 1024)}MB.")
            width, height = get_image_dimensions(file)
            max_width, max_height = 1920, 1080
            if width > max_width or height > max_height:
                raise serializers.ValidationError(f"Image dimensions exceed {max_width}x{max_height} pixels.")
        return data
