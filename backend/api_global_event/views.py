from typing import Dict, Any

from django.shortcuts import render
from rest_framework.views import APIView

from api_global_event.serializers import GlobalEventModelSerializer
from api_users.models import UserModel
from backend.global_function import *

from api_global_event.models import *


# Create your views here.
class GetGlobalEventView(APIView):
    def get(self, request):
        active_event: GlobalEventModel = GlobalEventModel.objects.filter(active=True).last()
        if not active_event:
            return success_with_text(None)

        data = GlobalEventModelSerializer(active_event).data
        if active_event.type == GlobalEventTypes.bars:
            bbb: dict[str, int | str | Any] = {
                'key': 'number',
                'value': UserModel.objects.filter(pk__lt=request.user.pk, is_staff=False).count() + 1
            }
            data['datas'].append(bbb)
        return success_with_text(data)
