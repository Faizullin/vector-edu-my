from crispy_forms.layout import Layout, Row, Column, Submit
from django import forms
from django.forms import inlineformset_factory
from django.utils.translation import gettext_lazy as _

from api_lessons.models import QuestionComponent, QuestionAnswer
from lms.apps.core.utils.crud_base.forms import BaseForm


class QuestionMainForm(BaseForm):
    class Meta:
        model = QuestionComponent
        fields = (
            "text",
        )

    def get_crisply_layout(self, *args, **kwargs):
        return Layout(
            Row(
                Column('text', css_class='col-12 mb-3'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-primary'),
                    css_class='col-md-6 mb-3'
                ),
            ),
        )


class MultipleChoiceAnswerForm(BaseForm):
    text = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control'}))
    is_correct = forms.CharField(widget=forms.CheckboxInput(attrs={'class': 'form-control'}))

    class Meta:
        model = QuestionAnswer
        fields = (
            "text",
            "is_correct",
        )

    def get_crisply_layout(self, *args, **kwargs):
        return Layout(
            Row(
                Column('text', css_class='col-md-6 mb-3 answer-text-field-container'),
                Column('is_correct', css_class='col-md-6 mb-3 answer-is_correct-field-container'),
            ),
        )


MultipleChoiceFormSet = inlineformset_factory(
    QuestionComponent, QuestionAnswer,
    form=MultipleChoiceAnswerForm,
    extra=1,
    can_delete=True
)
