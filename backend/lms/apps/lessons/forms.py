from crispy_forms.layout import Layout, Submit, Row, Column
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from api_lessons.models import Lesson, LessonPage
from lms.apps.core.utils.crud_base.forms import BaseForm

UserModel = get_user_model()


class LessonForm(BaseForm):
    class Meta:
        model = Lesson
        fields = (
            "is_available_on_free",
            "lesson_batch",
            "title",
            "description",
            "order",
        )

    def get_crisply_layout(self, *args, **kwargs):
        return Layout(
            Row(
                Column('is_available_on_free', css_class='col-md-6 mb-3'),
                Column('lesson_batch', css_class='col-md-6 mb-3'),
                Column('title', css_class='col-md-6 mb-3'),
                Column('description', css_class='col-md-6 mb-3'),
                Column('order', css_class='col-md-6 mb-3'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-primary'),
                    css_class='col-md-6 mb-3'
                ),
            ),
        )


class LessonPageForm(BaseForm):
    class Meta:
        model = LessonPage
        fields = (
            "lesson",
            "order",
        )

    def get_crisply_layout(self, *args, **kwargs):
        return Layout(
            Row(
                Column("lesson", css_class='col-md-6 mb-3'),
                Column("order", css_class='col-md-6 mb-3'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-primary'),
                    css_class='col-md-6 mb-3'
                ),
            )
        )
