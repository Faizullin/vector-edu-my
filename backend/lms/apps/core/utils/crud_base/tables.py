from django.utils.safestring import mark_safe
from django.utils.translation import gettext as _


class Column:
    def __init__(self, field_name, header=None, orderable=False, searchable=False):
        self.field_name = field_name
        self.header = header  # Can be None
        self.orderable = orderable
        self.searchable = searchable
        self.validate_field()

    def get_data_attr_str(self):
        attributes = [
            f'data-orderable="{str(self.orderable).lower()}"',
            f'data-searchable="{str(self.searchable).lower()}"',
            f'data-name="{str(self.field_name)}"',
            f'data-data="{str(self.field_name)}"',

        ]
        return ' '.join(attributes)

    def validate_field(self):
        if not self.field_name:
            raise ValueError("Field name cannot be empty.")
        if not isinstance(self.field_name, str):
            raise ValueError("Field name must be a string.")


class ActionsColumn(Column):
    def __init__(self, field_name='actions', actions=None, extra_actions=None):
        super().__init__(field_name=field_name, header="Actions", orderable=False, searchable=False)
        if actions is None:
            actions = []
        self.actions = actions
        self.extra_actions = extra_actions or []

    def get_data_attr_str(self):
        data = super().get_data_attr_str()
        action_data = [
            f'{{"name": "{action.name}", "url": "{action.redirect_url_name}", "label": "{action.label}"}}'
            for action in self.actions
        ]
        extra_action_data = [
            f'{{"name": "{action.name}", "url": "{action.redirect_url_name}", "label": "{action.label}"}}'
            for action in self.extra_actions
        ]
        actions_str = '[' + ','.join(action_data) + ']'
        extra_actions_str = '[' + ','.join(extra_action_data) + ']'
        return f"data-actions='{actions_str}' data-extra-actions='{extra_actions_str}' data-role='actions' ${data}"


class Table:
    class Meta:
        model = None
        source_url = ""
        fields = []
        table_id = "data-table"

    def __init__(self):
        if not hasattr(self, 'Meta') or not self.Meta.model:
            raise ValueError("Table must have a Meta class with a model defined.")

        self.table_id = getattr(self.Meta, "table_id", "data-table")
        self.columns = self.collect_columns()
        self.validate_model_fields()

    def collect_columns(self):
        """ Collects Column instances and orders them based on Meta.fields """
        declared_columns = {attr_name: getattr(self, attr_name) for attr_name in dir(self) if
                            isinstance(getattr(self, attr_name), Column)}

        # Use Meta.fields order if defined, otherwise use declared order
        ordered_columns = []
        if hasattr(self.Meta, 'fields') and self.Meta.fields:
            for field in self.Meta.fields:
                if field in declared_columns:
                    ordered_columns.append(declared_columns[field])
        else:
            ordered_columns = list(declared_columns.values())  # Default to declared order
        return ordered_columns

    def validate_model_fields(self):
        # model_fields = [field.name for field in self.Meta.model._meta.fields]
        # for column in self.columns:
        #     if not isinstance(column, ActionsColumn):
        #         if column.field_name and column.field_name not in model_fields:
        #             raise ValueError(
        #                 f"Field '{column.field_name}' does not exist in model '{self.Meta.model.__name__}'.")
        #         if column.header is None:
        #             column.header = self.Meta.model._meta.get_field(column.field_name).verbose_name.title()

        model = self.Meta.model
        initial_model_fields = {field.name: field for field in model._meta.fields}

        for column in self.columns:
            model_fields = initial_model_fields
            if not isinstance(column, ActionsColumn):
                field_path = column.field_name.split('.')

                current_field = None
                current_model = model

                for field_name in field_path:
                    if field_name in model_fields:
                        current_field = model_fields[field_name]
                        if hasattr(current_field,
                                   'related_model') and current_field.related_model:  # It's a ForeignKey or OneToOneField4
                            current_model = current_field.related_model
                            model_fields = {field.name: field for field in current_model._meta.fields}
                    else:
                        raise ValueError(f"Field '{column.field_name}' does not exist in model '{model.__name__}'.")

                if column.header is None:
                    column.header = field_name.replace('_', ' ').title()

    def validate_column(self, column):
        if not isinstance(column, Column):
            raise ValueError("Invalid column type. Must be an instance of Column or its subclass.")

    def render_header(self):
        headers = [f'<th {col.get_data_attr_str()}>{col.header}</th>' for col in self.columns]
        return f"<thead><tr>{''.join(headers)}</tr></thead>"

    def render_table(self):
        """ Renders the complete table with empty <tbody> """
        source_url = getattr(self.Meta, "source_url", "")
        table_id = self.table_id

        return mark_safe(f"""
              <table id="{table_id}" class="table table-striped" data-source-url="{source_url}">
                  {self.render_header()}
                  <tbody></tbody>  <!-- Empty body to be filled dynamically -->
              </table>
          """)


class ButtonAction:
    def __init__(self, name, label, redirect_url_name):
        self.name = name
        self.label = label
        self.redirect_url_name = redirect_url_name


class DefaultEditAction:
    def __init__(self, name='edit', label=_("Edit"), redirect_url_name=''):
        self.name = name
        self.redirect_url_name = redirect_url_name
        self.label = label


class DefaultDeleteAction:
    def __init__(self, name='delete', label=_("Delete"), redirect_url_name=''):
        self.name = name
        self.redirect_url_name = redirect_url_name
        self.label = label
