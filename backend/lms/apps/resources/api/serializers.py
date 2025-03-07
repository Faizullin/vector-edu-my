from django.contrib.auth import get_user_model
from rest_framework import serializers

from api_lessons.models import QuestionAnswer, QuestionComponent
from lms.apps.posts.models import Post, Category, Tag

User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "title", "term", "description", "created_at", "updated_at"]


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer()
    category = CategorySerializer()

    class Meta:
        model = Post
        fields = ["id", "title", "author", "category", "created_at", "updated_at", "publication_status", "meta_title"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "title", ]


class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = '__all__'


class QuestionComponentSerializer(serializers.ModelSerializer):
    answers = QuestionAnswerSerializer(many=True)

    class Meta:
        model = QuestionComponent
        fields = '__all__'
