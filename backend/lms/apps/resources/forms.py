from crispy_forms.layout import Layout, Submit, Row, Column, Button
from django.shortcuts import resolve_url
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model


from lms.apps.posts.models import Post
from lms.apps.core.utils.crud_base.fields import ThumbnailAttachmentField, ForeignKeySelect2Field, ShareAccessSelect2Field
from lms.apps.core.utils.crud_base.forms import BaseForm

from lms.apps.posts.models import Tag, Post
from .url_reverses import url_reverses_dict

UserModel = get_user_model()


class PostForm(BaseForm):
    thumbnail = ThumbnailAttachmentField(help_text=_("Asynchronous save."), required=False)
    users_share = ShareAccessSelect2Field(
        help_text=_("Asynchronous save."),
    )
    tags = ForeignKeySelect2Field(
        queryset=Tag.objects.all(),
        required=False, url=url_reverses_dict["resources-tag-list-api"],
        key="id",
        label_field="title",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["users_share"].widget.form_meta = self._meta
        self.fields["users_share"].widget.form_instance = self.instance

    class Meta:
        model = Post
        fields = (
            "title",
            "publication_status",
            "category",
            "thumbnail",
            "tags",
            "users_share"
        )

    def get_crisply_layout(self, *args, **kwargs):
        instance = kwargs.get('instance', None)
        content_editor_link_btn = Button(
            "edit-content-redirect-btn",
            _("Edit Content"),
            css_class="btn-secondary",
            onClick="window.location.href='{}'".format(
                resolve_url("lms:resources-post-edit-content", pk=instance.pk)) if instance else "",
            disabled=not bool(instance),
        )
        return Layout(
            Row(
                Column('title', css_class='col-md-6 mb-3'),
                Column('publication_status', css_class='col-md-6 mb-3'),
                Column('category', css_class='col-md-6 mb-3'),
                Column('tags', css_class='col-md-6 mb-3'),
                Column('thumbnail', css_class='col-md-6 mb-3'),
                Column('users_share', css_class='col-md-6 mb-3') if instance else None,
                Column(
                    Submit('submit', _('Save'), css_class='btn-primary'),
                    content_editor_link_btn,
                    css_class='col-md-6 mb-3'
                ),
            ),
        )

    def init_add_page_disabled(self, *args, **kwargs):
        if not kwargs['instance']:
            self.fields["thumbnail"].disabled = True
