from rest_framework import serializers

from api_global_event.models import *


class GlobalEventDataModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalEventDataModel
        fields = ['key', 'value']


class GlobalEventModelSerializer(serializers.ModelSerializer):
    datas = GlobalEventDataModelSerializer(many=True)

    class Meta:
        model = GlobalEventModel
        fields = ['title', 'type', 'datas']
