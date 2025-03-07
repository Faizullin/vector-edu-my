from lms.apps.core.utils.admin import BaseAdmin, admin
from .models import Attachment


@admin.register(Attachment)
class AttachmentAdmin(BaseAdmin):
    pass
