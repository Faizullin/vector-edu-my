from crispy_forms.helper import FormHelper
from django import forms


class BaseForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(BaseForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = self.get_crisply_layout(*args, **kwargs)
        self.init_add_page_disabled(*args, **kwargs)

    def get_crisply_layout(self, *args, **kwargs):
        return self.helper.build_default_layout(self)

    def init_add_page_disabled(self, *args, **kwargs):
        pass


__ALL__ = ["BaseForm"]
