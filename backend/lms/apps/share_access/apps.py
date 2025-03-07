from django.urls import path
from django.utils.translation import gettext_lazy as _

from lms.core.application import LmsDashboardConfig
from lms.core.loading import get_class


class ShareAccessdConfig(LmsDashboardConfig):
    name = "lms.apps.share_access"
    verbose_name = _("Share Access")
