from django.forms import ModelChoiceField, ModelMultipleChoiceField, Field

from .widgets import ThumbnailAttachmentWidget, GenericModelSelectWidget, ShareAccessWidget

from lms.apps.attachments.models import Attachment


class ThumbnailAttachmentField(ModelChoiceField):
    widget = ThumbnailAttachmentWidget

    def __init__(self, *args, **kwargs):
        kwargs["queryset"] = Attachment.objects.all()
        super().__init__(*args, **kwargs)


class ForeignKeySelect2Field(ModelMultipleChoiceField):
    widget = GenericModelSelectWidget

    def __init__(self, *args, **kwargs):
        self.url = kwargs.pop('url')
        self.label_field = kwargs.pop('label_field')
        self.key = kwargs.pop('key')
        super().__init__(*args, **kwargs)

    def widget_attrs(self, widget):
        attrs = super().widget_attrs(widget)
        attrs["data-manager-options"] = self.get_manager_options_data()
        return attrs

    def get_manager_options_data(self):
        return f'{{"url": "{self.url}", "key": "{self.key}", "label_field": "{self.label_field}", "multiple": true}}'


class ShareAccessSelect2Field(Field):

    def __init__(self, *args, **kwargs):
        kwargs['required'] = False
        perms = kwargs.pop("permissions", None)
        if perms is None:
            perms = ["view", "change"]
        self.widget_data = {
            "permissions": perms,
        }
        kwargs['widget'] = ShareAccessWidget(
            **self.widget_data
        )
        super().__init__(*args, **kwargs)
