from lms.apps.posts.models import Post
from lms.apps.resources.api.serializers import CategorySerializer, PostAuthorSerializer
from rest_framework import serializers


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

    content = serializers.CharField(required=True)
