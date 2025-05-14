from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.views.generic import TemplateView


User = get_user_model()


class IndexView(TemplateView):

    def get_template_names(self):
        return [
            "lms/index.html",
        ]
        if self.request.user.is_staff:
            return [
                "lms/index.html",
            ]
        else:
            return ["lms/index_nonstaff.html", "lms/dashboard/index.html"]
