from django.template.loader import render_to_string
from django_filters import CharFilter
from django_filters.rest_framework import FilterSet
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response

from api_lessons.models import QuestionComponent, MatchingComponent, FillTextComponent
from lms.apps.core.utils.api_actions import BaseAction, BaseActionException
from lms.apps.core.utils.crud_base.views import BaseListApiView
from lms.apps.editor.api.views import BaseContentEditorActionAPIView, BaseUploadImageByFileAction, BaseSaveContentAction
from lms.apps.posts.models import Post, Tag
from .component_forms import MultipleChoiceFormSet, QuestionMainForm
from .serializers import PostSerializer, TagSerializer, QuestionComponentSerializer, QuestionAnswerSerializer


##########################################################
# Posts
# ########################################################
class ResourcesPostListAPIView(BaseListApiView):
    serializer_class = PostSerializer
    search_fields = ['title', 'content']

    authentication_classes = [SessionAuthentication, ]

    class PostFilter(FilterSet):
        title = CharFilter(lookup_expr='icontains')

        class Meta:
            model = Post
            fields = ['id', 'title', 'publication_status', 'category', 'author']

    filterset_class = PostFilter

    def get_queryset(self):
        queryset = Post.objects.all().prefetch_related('author', 'category', 'thumbnail')
        return queryset


def get_component_from_name(name: str):
    dict_data = {
        "question": QuestionComponent,
        "matching": MatchingComponent,
        "fill-text": FillTextComponent,
    }
    return dict_data.get(name, None)


class BaseComponentData:
    steps = ["main"]

    def __init__(self, component_model, form_class, serializer_class=None):
        self.component_model = component_model
        self.form_class = form_class
        self.serializer_class = serializer_class

    def get_form(self, step, obj=None, request=None):
        args = []
        if request:
            args.append(request.POST)
            args.append(request.FILES)
        kwargs = {}
        if obj:
            kwargs["instance"] = obj
        return self.form_class(*args, **kwargs)

    def get_rendered_string(self, step, obj=None, request=None):
        return render_to_string("lms/partials/components/base.html", self.get_render_context(step, obj, request))

    def get_render_context(self, step, obj=None, request=None):
        form = self.get_form(step, obj, request)
        return {
            "form": form,
            "instance": obj,
        }

    def get_complete_response(self, step, obj=None, request=None):
        data = {
            "form": self.get_rendered_string(step, obj, request),
            "steps": self.steps,
        }
        if obj is not None:
            data["instance"] = self.serializer_class(obj).data
        return data

    def submit_and_get_response(self, step, obj, request):
        form = self.get_form(step, obj, request)
        is_valid = form.is_valid()
        if is_valid:
            updated_obj = form.save()
            return {
                "success": 1,
                "instance": self.serializer_class(updated_obj).data,
                "steps": self.steps,
            }
        html = self.get_rendered_string(step, obj, request),
        return {
            "success": 0,
            "message": "Invalid form",
            "errors": form.errors,
            "form": html,
            "steps": self.steps,
        }


class QuestionComponentData(BaseComponentData):
    steps = ["main", "answers"]

    def __init__(self):
        super().__init__(component_model=QuestionComponent, form_class=QuestionMainForm,
                         serializer_class=QuestionComponentSerializer)

    def get_form(self, step, obj=None, request=None):
        if step == "main":
            return super().get_form(step, obj, request)
        if step == "answers":
            args = []
            if request:
                args.append(request.POST)
                args.append(request.FILES)
            kwargs = {}
            if obj:
                kwargs["instance"] = obj
            return MultipleChoiceFormSet(*args, **kwargs)

    def get_rendered_string(self, step, obj=None, request=None):
        if step == "main":
            return super().get_rendered_string(step, obj, request)
        elif step == "answers":
            context = self.get_render_context(step, obj, request)
            context["formset"] = context["form"]
            return render_to_string("lms/partials/components/question_answers.html", context)
        else:
            raise BaseActionException("Step is invalid")

    def submit_and_get_response(self, step, obj, request):
        form = self.get_form(step, obj, request)
        is_valid = form.is_valid()
        if is_valid:
            data = form.save()
            print(data)
            return {
                "success": 1,
                "data": QuestionAnswerSerializer(data, many=True).data,
                "steps": self.steps,
            }
        html = self.get_rendered_string(step, obj, request),
        return {
            "success": 0,
            "message": "Invalid form",
            "errors": form.errors,
            "form": html,
            "steps": self.steps,
        }


class ComponentFormLoadAction(BaseAction):
    name = "component-form-load"

    def apply(self, request):
        name = request.GET.get('name', None)
        step = request.GET.get('step', None)
        obj_id = request.GET.get('obj_id', None)
        if name is None:
            raise BaseActionException("`name` is required")
        if step is None:
            raise BaseActionException("`step` is required")
        obj_model = get_component_from_name(name)
        if obj_model is None:
            raise BaseActionException("`name` is invalid")
        if obj_id is None:
            obj = None
        else:
            try:
                obj = obj_model.objects.get(pk=obj_id)
            except obj_model.DoesNotExist:
                raise BaseActionException("`obj_id` is invalid")
            except Exception as e:
                raise BaseActionException(str(e))

        if name == "question":
            form_data = QuestionComponentData()
            return {
                "success": 1,
                "data": form_data.get_complete_response(step, obj),
            }

        return {
            "success": 0,
            "message": "Not implemented"
        }


class ComponentFormSubmitAction(BaseAction):
    name = "component-form-submit"

    def apply(self, request):
        name = request.GET.get('name', None)
        step = request.GET.get('step', None)
        obj_id = request.GET.get('obj_id', None)
        if name is None:
            raise BaseActionException("`name` is required")
        if step is None:
            raise BaseActionException("`step` is required")
        obj_model = get_component_from_name(name)
        if obj_model is None:
            raise BaseActionException("`name` is invalid")
        if obj_id is None:
            obj = None
        else:
            try:
                obj = obj_model.objects.get(pk=obj_id)
            except obj_model.DoesNotExist:
                raise BaseActionException("`obj_id` is invalid")
            except Exception as e:
                raise BaseActionException(str(e))

        if name == "question":
            form_data = QuestionComponentData()
            return {
                "success": 1,
                "data": form_data.submit_and_get_response(step, obj, request),
            }
        return {
            "success": 0,
            "message": "Not implemented"
        }


class ResourcesPostEditContentActionAPIView(BaseContentEditorActionAPIView):
    authentication_classes = [SessionAuthentication, ]

    available_get_actions = [
        ComponentFormLoadAction(),
    ]
    available_post_actions = [
        ComponentFormSubmitAction(),
        BaseUploadImageByFileAction(),
        BaseSaveContentAction(),
    ]

    def get(self, request):
        action = request.GET.get('action', None)
        if action is None:
            return Response({'success': 0, "message": "`action` is required"}, status=status.HTTP_400_BAD_REQUEST)
        use_action = None
        for i in self.available_get_actions:
            if i.name == action:
                use_action = i
                break
        if use_action is None:
            return Response({'success': 0, "message": "`action` is invalid"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            response = use_action.apply(request)
            return Response(response, status=status.HTTP_200_OK)
        except BaseActionException as e:
            return Response({'success': 0, 'message': str(e)}, status=e.status)

    def post(self, request):
        action = request.GET.get('action', None)
        if action is None:
            return Response({'success': 0, "message": "`action` is required"}, status=status.HTTP_400_BAD_REQUEST)
        use_action = None
        for i in self.available_post_actions:
            if i.name == action:
                use_action = i
                break
        if use_action is None:
            return Response({'success': 0, "message": "`action` is invalid"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            response = use_action.apply(request)
            return Response(response, status=status.HTTP_200_OK)
        except BaseActionException as e:
            return Response({'success': 0, 'message': str(e)}, status=e.status)


class TagListAPIView(BaseListApiView):
    serializer_class = TagSerializer
    search_fields = ['title']
    authentication_classes = [SessionAuthentication, ]

    def get_queryset(self):
        queryset = Tag.objects.all()
        return queryset
