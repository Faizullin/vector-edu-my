import json
from itertools import chain

from django import forms
from django.forms import widgets
from django.forms.utils import flatatt
from django.utils.encoding import force_str
from django.utils.html import escape, conditional_escape
from django.utils.safestring import mark_safe

from django.contrib.auth import get_user_model
from lms.apps.attachments.models import Attachment



UserModel = get_user_model()
# from guardian.shortcuts import get_users_with_perms


class ThumbnailAttachmentWidget(widgets.Widget):
    template_name = 'lms/widgets/thumbnail_attachment_widget.html'

    def __init__(self, attrs=None):
        super().__init__(attrs)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if value:
            related_instance_obj = Attachment.objects.get(pk=value)
            context['related_instance_obj'] = related_instance_obj
        return context


class Select(widgets.Input):
    allow_multiple_selected = False

    js_options_map = {
        'maximum_selection_size': 'maximumSelectionSize',
        'allow_clear': 'allowClear',
        'minimum_input_length': 'minimumInputLength',
        'minimum_results_for_search': 'minimumResultsForSearch',
        'close_on_select': 'closeOnSelect',
        'open_on_enter': 'openOnEnter',
        'token_separators': 'tokenSeparators',
        'ajax_quiet_millis': 'quietMillis',
        'quiet_millis': 'quietMillis',
        'data_type': 'dataType',
    }

    js_options = None
    sortable = False
    default_class = ('django-select2',)
    ajax = False

    def __init__(self, attrs=None, choices=(), js_options=None, *args, **kwargs):
        self.ajax = kwargs.pop('ajax', self.ajax)
        self.js_options = {}
        if js_options is not None:
            for k, v in js_options.items():
                if k in self.js_options_map:
                    k = self.js_options_map[k]
                self.js_options[k] = v

        attrs = attrs.copy() if attrs is not None else {}

        if 'sortable' in kwargs:
            self.sortable = kwargs.pop('sortable')

        self.attrs = getattr(self, 'attrs', {}) or {}

        def combine_css_classes(a, b):
            return ' '.join([a, b]) if a else b

        self.attrs.update({
            'data-placeholder': kwargs.pop('overlay', None),
            'class': combine_css_classes(attrs.get('class', ''), self.default_class),
            'data-sortable': json.dumps(self.sortable),
        })

        self.attrs.update(attrs)
        self.choices = iter(choices)
        super().__init__(attrs)

    def render(self, name, value, attrs=None, choices=(), js_options=None, **kwargs):
        options = {}
        attrs = dict(self.attrs, **(attrs or {}))
        js_options = js_options or {}

        for k, v in dict(self.js_options, **js_options).items():
            if k in self.js_options_map:
                k = self.js_options_map[k]
            options[k] = v

        if self.ajax:
            ajax_url = options.pop('ajax_url', None)
            quiet_millis = options.pop('quietMillis', 100)
            is_jsonp = options.pop('jsonp', False)

            ajax_opts = options.get('ajax', {})

            default_ajax_opts = {
                'url': ajax_url or self.reverse('select2_fetch_items'),
                'dataType': 'jsonp' if is_jsonp else 'json',
                'quietMillis': quiet_millis,
            }
            for k, v in ajax_opts.items():
                if k in self.js_options_map:
                    k = self.js_options_map[k]
                default_ajax_opts[k] = v
            options['ajax'] = default_ajax_opts

        if not self.is_required:
            options.update({'allowClear': options.get('allowClear', True)})

        if self.sortable and not self.ajax:
            data = []
            for option_value, option_label in chain(self.choices, choices):
                data.append(self.option_to_data(option_value, option_label))
            options['data'] = list([_f for _f in data if _f])

        attrs.update({
            'data-select2-options': json.dumps(options),
        })

        if self.ajax:
            attrs.update({
                'data-init-selection-url': self.reverse('select2_init_selection'),
            })
        if self.ajax or self.sortable:
            self.input_type = 'hidden'
            return super(Select, self).render(name, value, attrs=attrs)
        else:
            return self.render_select(name, value, attrs=attrs, choices=choices)

    def render_select(self, name, value, attrs=None, choices=()):
        if value is None:
            value = ''
        attrs = attrs or {}
        attrs['name'] = name
        final_attrs = self.build_attrs(attrs)
        output = [u'<select%s>' % flatatt(final_attrs)]
        if not isinstance(value, (list, tuple)):
            value = [value]
        options = self.render_options(choices, value)
        if options:
            output.append(options)
        output.append(u'</select>')
        return mark_safe(u'\n'.join(output))

    def render_option(self, selected_choices, option_value, option_label):
        option_value = force_str(option_value)
        if option_value in selected_choices:
            selected_html = u' selected="selected"'
            if not self.allow_multiple_selected:
                # Only allow for a single selection.
                selected_choices.remove(option_value)
        else:
            selected_html = ''
        return u'<option value="%s"%s>%s</option>' % (
            escape(option_value), selected_html,
            conditional_escape(str(option_label)))

    def render_options(self, choices, selected_choices):
        # Normalize to strings.
        selected_choices = set(force_str(v) for v in selected_choices)
        output = []
        for option_value, option_label in chain(self.choices, choices):
            if isinstance(option_label, (list, tuple)):
                output.append(u'<optgroup label="%s">' % escape(force_str(option_value)))
                for option in option_label:
                    output.append(self.render_option(selected_choices, *option))
                output.append(u'</optgroup>')
            else:
                output.append(self.render_option(selected_choices, option_value, option_label))
        return u'\n'.join(output)


class SelectMultiple(Select):
    allow_multiple_selected = True


class GenericModelSelectWidget(widgets.SelectMultiple):

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context.update({
            "name": name,
            "value": value,
        })
        return context

    def value_from_datadict(self, data, files, name):
        default = super().value_from_datadict(data, files, name)
        return default




class ShareAccessWidget(forms.Widget):
    template_name = "lms/widgets/share_access_widget.html"
    form_instance = None
    form_meta = None

    def __init__(self, **kwargs):
        self.permissions = kwargs.pop("permissions")
        super().__init__(**kwargs)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        users_qs = self.get_accessed_users_queryset()
        context.update({
            "users": users_qs,
        })
        return context

    def get_accessed_users_queryset(self):
        model_class = self.form_meta.model
        perms = set([f"{perm}_{model_class._meta.model_name}" for perm in self.permissions])
        users = UserModel.objects.all()
        # users = get_users_with_perms(
        #     self.form_instance,
        #     # attach_perms=False,
        #     # with_superusers=False,
        #     # only_with_perms_in=perms,
        # )
        # print("users_qs", users, perms, self.form_instance, model_class)
        return users
