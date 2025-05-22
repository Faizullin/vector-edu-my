from lms.apps.core.utils.crud_base.views import BaseListApiView
from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model 
from rest_framework.authentication import SessionAuthentication


from .serializers import ShareAccessObjUsersListSerializer, ShareAccessObjUsersUpdateSerializer

User = get_user_model()


class GetAccessObjUsersListAction(BaseAction):
    name = "get_access_obj_users_list"

    def apply(self, request):
        users = User.objects.all()
        return {
            "success": 1,
            "users": users
        }
        # content_type, related_obj = self.get_content_type_obj_from_request(request)
        # print("related_obj", related_obj)
        # return {
        #     "success": 1,
        #     "users": get_users_with_perms(
        #         related_obj,
        #         # attach_perms=False,
        #         # with_superusers=False,
        #         # with_group_users=False,
        #     )
        # }

    def get_content_obj_data_raw_from_request(self, request):
        content_type = request.GET.get('content_type', None)
        object_id = request.GET.get('object_id', None)
        return content_type, object_id


class SubmitAccessObjUsersListAction(BaseAction):
    name = "submit_access_obj_users_list"

    def apply(self, request):
        user_ids = request.data.getlist("users[]", None)
        if user_ids is None:
            raise BaseActionException("No users data provided")
        if not isinstance(user_ids, list):
            raise BaseActionException("Invalid users data provided")
        try:
            user_ids = list(map(int, user_ids))
        except ValueError:
            raise BaseActionException("Invalid users data provided")
        content_type, related_obj = self.get_content_type_obj_from_request(request)
        new_users = User.objects.filter(id__in=user_ids)
        new_user_ids = [user.id for user in new_users]
        current_users = get_users_with_perms(related_obj)

        # to_remove_users = [user for user in current_users if user.id not in new_user_ids]
        # print("to_remove_users", to_remove_users)
        UserObjectPermission.objects.delete(user__in=to_remove_users, content_type=content_type,
                                            object_pk=related_obj.pk)
        current_user_ids = [user.id for user in current_users]
        to_add_users = [user for user in new_users if user.id not in current_user_ids]
        # print("to_add_users", to_add_users)
        for user in to_add_users:
            assign_perm("view", user, related_obj)
            assign_perm("change", user, related_obj)

        return {
            "success": 1,
        }


class ShareAccessObjUsersListAPIView(BaseListApiView):
    serializer_class = ShareAccessObjUsersListSerializer
    permission_classes = [permissions.IsAuthenticated]
    action = GetAccessObjUsersListAction()

    def get(self, request, *args, **kwargs):
        try:
            response = self.action.apply(request)
        except BaseActionException as e:
            return Response({'success': 0, 'message': str(e)}, status=e.status)
        queryset = response["users"]
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShareAccessObjUsersUpdateAPIView(APIView):
    serializer_class = ShareAccessObjUsersUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    action = SubmitAccessObjUsersListAction()
    authentication_classes = [SessionAuthentication,]

    def post(self, request, *args, **kwargs):
        try:
            response = self.action.apply(request)
            return Response(response, status=status.HTTP_200_OK)
        except BaseActionException as e:
            return Response({'success': 0, 'message': str(e)}, status=e.status)
