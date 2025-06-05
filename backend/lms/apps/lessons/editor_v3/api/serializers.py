from lms.apps.core.models import PublicationStatus
from rest_framework import serializers
from lms.apps.posts.models import Post
from lms.apps.resources.api.serializers import CategorySerializer, PostAuthorSerializer
from lms.apps.lessons.models import TemplateComponent, UrlVideoComponent, VimeoUrlCacheModel


class BasePostEditSerializer(serializers.Serializer):
    post_id = serializers.IntegerField(required=True, write_only=True)


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer()
    category = CategorySerializer()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "author",
            "category",
            "created_at",
            "updated_at",
            "publication_status",
            "meta_title",
        ]


class SaveContentSerializer(BasePostEditSerializer):
    """
    Serializer for saving content.
    """

    content = serializers.CharField(required=True)


class BuildAndPublishContentSerializer(BasePostEditSerializer):
    """
    Serializer for building and publishing content.
    """

    publication_status = serializers.ChoiceField(
        choices=PublicationStatus.choices,
        required=True,
        help_text="Publication status of the post.",
    )


class LoadComponentObjDataItemSerializer(serializers.Serializer):
    component_type = serializers.CharField(required=True)
    object_id = serializers.IntegerField(required=True)


class LoadComponentObjDataSerializer(BasePostEditSerializer):
    items = LoadComponentObjDataItemSerializer(many=True, required=True)


class FileControlActionChoices:
    UPLOAD = "upload_file"
    REMOVE = "remove_file"

    CHOICES = (
        (UPLOAD, "Upload File"),
        (REMOVE, "Remove File"),
    )


class FileControlSerializer(BasePostEditSerializer):
    file_action = serializers.ChoiceField(choices=FileControlActionChoices.CHOICES)
    file = serializers.FileField(required=False, allow_null=True)
    
    def validate(self, data):
        file_action = data.get("file_action")
        file = data.get("file", None)

        if file_action == FileControlActionChoices.UPLOAD:
            if file is None:
                raise serializers.ValidationError(
                    {"file": "File is required for upload."}
                )

            # Optional: Include format and size validation here
            self.validate_file_format(file)
            self.validate_file_size(file)

        elif file_action == FileControlActionChoices.REMOVE:
            if file:
                raise serializers.ValidationError(
                    {"file": "File should not be provided for remove."}
                )

        return data

    def validate_file_format(self, file):
        allowed_mime_types = ["image/jpeg", "image/png", "audio/mpeg"]
        if file.content_type not in allowed_mime_types:
            raise serializers.ValidationError({"file": "Unsupported file format."})

    def validate_file_size(self, file, file_size_limit_b=None):
        if file_size_limit_b is None:
            file_size_limit_b = 10 * 1024 * 1024  # Default to 10MB
        max_size_mb = int(file_size_limit_b / (1024 * 1024))  # Convert bytes to MB
        if file.size > file_size_limit_b:
            raise serializers.ValidationError(
                {"file": f"File size exceeds {max_size_mb}MB."}
            )


class TemplateComponentSerializer(serializers.ModelSerializer):
    """
    Serializer for TemplateComponent.
    """

    class Meta:
        model = TemplateComponent
        fields = [
            "id",
            "title",
            "content",
            "component_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        if not data.get("title"):
            raise serializers.ValidationError({"title": "Title is required."})
        if not data.get("content"):
            raise serializers.ValidationError({"content": "Content is required."})
        return data
