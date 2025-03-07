from rest_framework.views import APIView
from rest_framework.request import Request

from api_users.serializers import *
from backend.global_function import error_with_text, success_with_text


class EditPhotoView(APIView):
    def post(self, request: Request):
        data = request.data.dict()
        if data.get('image', None) is not None:
            if request.user.photo:
                request.user.photo.delete()

            image_data = data.pop('image')
            request.user.photo = image_data
            request.user.save()

            return success_with_text(UserModelSerializer(request.user).data)
        return error_with_text('No image provided')


class EditUserSettingsView(APIView):
    def post(self, request: Request):
        serializer: EditUserSettingsSerializer = EditUserSettingsSerializer(request.user, data=request.data,
                                                                            partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_with_text(UserModelSerializer(request.user).data)
