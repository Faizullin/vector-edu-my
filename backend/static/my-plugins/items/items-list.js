class ItemListTable {
    constructor() {
        this.itemsListData = window.server_conf.items_list;
        this.actionsData = {
            default: [],
            extra: [],
        };

    }

    getListUrlParams(data) {
        const new_data = {
            draw: data.draw,
        };
        if (data.start >= 0) {
            new_data.page = data.start + 1;
        }
        if (data.order.length > 0) {
            let new_value = data.order[0]["name"];
            if (data.order[0]['dir'] !== 'asc') {
                new_value = "-" + new_value;
            }
            new_data.order = new_value;
            new_data.ordering = new_value;
        }
        if (data.search.value) {
            new_data.search = data.search.value;
        }
        if (data.length) {
            new_data.page_size = data.length;
        }
        return new_data;
    }

    getColumns() {
        return this.getDefaultColumns();
    }

    getDefaultColumns() {
        const self = this;
        const columnsData = this.itemsListData.columns;
        const actionButtons = [];
        const actionsColumnIndex = columnsData.findIndex(function (column) {
            return column.role === "actions";
        });
        if (actionsColumnIndex > -1) {
            const actionLabels = {
                edit: function (action) {
                    return `<i class='ti ti-edit f-20'></i>`;
                },
                delete: function (action) {
                    return `<i class='ti ti-trash f-20'></i>`;
                },
                default: function (action) {
                    return action.label;
                }
            };
            columnsData[actionsColumnIndex].actions.forEach(function (action) {
                const ac = actionLabels[action.name] || actionLabels.default;
                actionButtons.push(`<button class="btn btn-sm ${action.class || ""} ${action.name}-action-btn">${ac(action)}</i></button>`);
                self.actionsData.default.push(action);
            });
            const extraActions = columnsData[actionsColumnIndex].extraActions || [];

            if (extraActions.length > 0) {
                extraActions.forEach(function (action) {
                    const ac = actionLabels[action.name] || actionLabels.default;
                    actionButtons.push(`<button class="btn btn-sm ${action.class || ""} ${action.name}-action-btn">${ac(action)}</i></button>`);
                    self.actionsData.extra.push(action);
                });
            }
            const actionButtonsStr = actionButtons.join(" ");
            columnsData[actionsColumnIndex] = {
                data: null,
                className: 'dt-center record-actions',
                defaultContent: actionButtonsStr,
                orderable: false,
                name: "Actions",
            }
        }
        return columnsData;
    }

    init() {
        this.initDefault();
    }

    initTableHead() {
        const theadEl = this.tableEl.find("thead");
        const filterRow = $('<tr>').appendTo(theadEl);
        const self = this;


        this.columns.forEach(column => {
            console.log({...column});
            const th = $('<th>').appendTo(filterRow);


            $('<input>', {
                type: 'text',
                placeholder: `Search ${column.name}`,
                class: 'column-filter'
            }).appendTo(th);
            return;
            if (column.searchable) {
                if (column.type === 'text') {
                    $('<input>', {
                        type: 'text',
                        placeholder: `Search ${column.name}`,
                        class: 'column-filter'
                    }).appendTo(th);
                } else if (column.type === 'select') {
                    const select = $('<select>', {
                        class: 'column-filter'
                    }).appendTo(th);
                    $('<option>', {value: '', text: 'Select'}).appendTo(select);
                    column.options.forEach(option => {
                        $('<option>', {value: option.value, text: option.label}).appendTo(select);
                    });
                } else if (column.type === 'multi-select') {
                    const select = $('<select>', {
                        class: 'column-filter',
                        multiple: 'multiple'
                    }).appendTo(th);
                    column.options.forEach(option => {
                        $('<option>', {value: option.value, text: option.label}).appendTo(select);
                    });
                }
            }
        });

        // Add event listeners for filtering
        theadEl.on('keyup change', '.column-filter', function () {
            const columnIndex = $(this).parent().index();
            const value = $(this).val();
            if (self.tableDatatable.column(columnIndex).search() !== value) {
                self.tableDatatable
                    .column(columnIndex)
                    .search(value)
                    .draw();
            }
        });
    }

    _initDataTable() {
        const self = this;
        self.tableDatatable = self.tableEl.DataTable({
            columns: self.columns,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, 'All']
            ],
            processing: true,
            serverSide: true,
            "responsive": true,
            "ajax": function (data, callback, settings) {
                $.get(self.itemsListData.listApiUrl, self.getListUrlParams(data), function (res) {
                    const count = res.count;
                    const results = res.results;
                    callback({
                        recordsTotal: count,
                        recordsFiltered: count,
                        data: results,
                    });
                });
            },
        });
    }

    initDefault() {
        const self = this;

        const columns_data = [];
        this.tableEl = $(`#${this.itemsListData.tableId}`);
        this.tableEl.find("thead th").each(function (a, el) {
            const dd = $(el).data();
            columns_data.push(dd);
        });
        this.itemsListData.columns = columns_data;

        this.columns = self.getColumns();
        // this.initTableHead();
        this.itemsListData.listApiUrl = self.tableEl.data("source-url");

        self._initDataTable();

        // Edit record
        self.tableDatatable.on('click', '.edit-action-btn', function (e) {
            const tr_el = $(this).closest("tr");
            const record_data = self.tableDatatable.row(tr_el).data();
            const editAction = self.actionsData.default.find(function (action) {
                return action.name === "edit";
            });
            if (!editAction) {
                return;
            }
            window.location.href = window.managers.urlFormatter.formatUrlById(editAction.url, record_data);
        });

        // Delete a record
        self.tableDatatable.on('click', '.delete-action-btn', function (e) {
            const tr_el = $(this).closest("tr");
            const record_data = self.tableDatatable.row(tr_el).data();
            if (confirm('Are you sure you want to delete this item?')) {
                $.ajax({
                    url: self.itemsListData.actions.row.delete.apiUrl,
                    type: 'DELETE',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
                    },
                    success: function () {
                        alert('Item deleted successfully.');
                        tr_el.remove();
                    },
                    error: function () {
                        alert('Failed to delete the item.');
                    }
                });
            }
        });
    }
}