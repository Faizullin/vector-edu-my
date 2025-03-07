class AttachmentModalManager {
    constructor() {
        this.modalElement = $(".attachments-list-modal");
        this.attachmentsGrid = this.modalElement.find(".attachments-list-grid");
        this.selectionConfirmButton = this.modalElement.find(".selection-confirm-btn");
        this.uploadButton = this.modalElement.find(".upload-btn");
        this.state = {
            attachmentsList: {
                data: [],
                isLoading: false,
            },
            modal: {
                useSelectAttachment: false,
                open: false,
                currentSelection: null,
                currentThumbnailImageWidget: null,
                onSelect: null,
            },
            delete: {
                isLoading: false,
            },
            upload: {
                isLoading: false,
                uploadAttachmentFile: null,
            }
        };
        this.api = window.server_conf.items_edit;
        this.FILE_TYPES_EXTENSIONS = {
            "word": [".doc", ".docx", ".word"],
            "pdf": [".pdf"],
            "text": [".text", ".txt"],
            "image": ['.jpg', '.jpeg', '.png'],
            "video": ['.mp4', '.avi'],
            "audio": ['.mp3', '.wav'],
        };
        this.initialize();
    }

    _getFiltersFromUseSelection(useSelectAttachment) {
        if (!useSelectAttachment) return null;
        else if (typeof useSelectAttachment === "object") {
            return {
                mimeTypes: useSelectAttachment.mimeTypes,
            };
        } else {
            return {
                mimeTypes: ["all"]
            };
        }
    }

    _getMimeTypeFromExtension(extension) {
        let result = null;
        Object.keys(this.FILE_TYPES_EXTENSIONS).forEach((key) => {
            const arr = this.FILE_TYPES_EXTENSIONS[key];
            if (arr.includes(extension)) {
                result = key;
            }
        });
        return result;
    }

    initialize() {
        this.uploadButton.prop("disabled", true);
        this.selectionConfirmButton.on("click", () => this.confirmSelection());
        const self = this;
        $(document).on("click", `.file-man-box`, function () {
            if (self.state.modal.open && self.state.modal.useSelectAttachment) {
                const item_id = $(this).data("item-id");
                const selected_item = self.state.attachmentsList.data.find(function (item) {
                    return item.id === item_id;
                });
                if (!selected_item) {
                    throw new Error("not found attachment item");
                }
                const selected_item_mime_type = self._getMimeTypeFromExtension(selected_item.extension);
                const filters = self._getFiltersFromUseSelection(self.state.modal.useSelectAttachment);
                if (filters.mimeTypes.includes("all") || filters.mimeTypes.includes(selected_item_mime_type)) {
                    self.selectAttachmentCard(selected_item);
                } else {
                    console.log("Invalid file type selected");
                }
            }
        });
        $(document).on("click", ".file-close", function (event) {
            event.preventDefault();
            const item_id = $($(this).closest(".file-man-box")).data("item-id");
            const selected_item = self.state.attachmentsList.data.find(function (item) {
                return item.id === item_id;
            });
            if (!selected_item) {
                throw new Error("not found attachment item");
            }
            if (confirm("Are you sure to delete this file?")) {
                self.state.delete.isLoading = true;
                self.fetchActionRelatedObject({
                    action: "delete_single",
                    obj_id: selected_item.id,
                }, {
                    success: function (response) {
                        self.state.delete.isLoading = false;
                        self.loadAttachments();
                    }
                });
            }
        });
        this.upload_dropzone_el = this.modalElement.find(".upload-dropzone").dropzone({
            url: self.api.upload.apiUrl,
            maxFiles: 1,
            acceptedFiles: "image/*",
            addRemoveLinks: !0,
            autoProcessQueue: false,
            init: function () {
                let files = 0
                this.on("addedfile", function (file) {
                    files++
                    if (!self.state.upload.uploadAttachmentFile && files === 1) {
                        self.state.upload.uploadAttachmentFile = file;
                        self.uploadButton.prop("disabled", false);
                    }
                })
                this.on('removedfile', function (file) {
                    files--
                    if (files === 0) {
                        self.state.upload.uploadAttachmentFile = null;
                        self.uploadButton.prop("disabled", true);
                    }
                });
                if (!self.state.upload.uploadAttachmentFile) {
                    self.uploadButton.prop("disabled", true);
                }
            },
        });
        this.uploadButton.click(function () {
            const formData = new FormData();
            formData.append('content_type', self.api.content_type);
            formData.append('object_id', self.api.object_id);
            formData.append('attachment_type', "file");
            formData.append('file', self.state.upload.uploadAttachmentFile);
            self.state.upload.isLoading = true;
            $.ajax({
                url: self.api.upload.apiUrl,
                type: 'POST',
                data: formData,
                dataType: 'JSON',
                mimeType: "multipart/form-data",
                contentType: false,
                cache: false,
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
                },
                error: function () {
                    self.state.upload.isLoading = false;
                },
                success: function (response) {
                    self.state.upload.isLoading = false;
                    self.upload_dropzone_el[0].dropzone.removeAllFiles();
                    self.state.upload.uploadAttachmentFile = null;
                    self.uploadButton.prop('disabled', true);
                    self.loadAttachments();
                },
            });
        });
    }

    formatFileSize(sizeInBytes) {
        if (!sizeInBytes) return "0 Bytes";
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const unitIndex = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
        return `${(sizeInBytes / Math.pow(1024, unitIndex)).toFixed(2)} ${units[unitIndex]}`;
    }

    async loadAttachments(filters = {}, callbacks = {success: null}) {
        const filtersData = {
            content_type: this.api.content_type,
            object_id: this.api.object_id,
            ...filters,
        };

        this.state.attachmentsList.isLoading = true;

        try {
            const response = await $.get(this.api.listApiUrl, filtersData);
            this.renderAttachments(response.results);
            this.state.attachmentsList.data = response.results;
            if (callbacks.success) callbacks.success(response);
        } catch (error) {
            console.error("Error loading attachments:", error);
        } finally {
            this.state.attachmentsList.isLoading = false;
        }
    }

    renderAttachments(attachments) {
        const FILE_TYPES_ICONS = {
            "word": "fa fa-file-word fa-3x",
            "pdf": "fa fa-file-pdf fa-3x",
            "text": "fa fa-file-text fa-3x",
            "image": "fa fa-file-image fa-3x",
            "video": "fa fa-file-video fa-3x",
            "file": "fa fa-file fa-3x",
        };
        const FILE_TYPES_EXTENSIONS = this.FILE_TYPES_EXTENSIONS
        this.attachmentsGrid.html(""); // Clear existing attachments
        attachments.forEach((attachment) => {
            const extensionKey = Object.keys(FILE_TYPES_EXTENSIONS).find((key) =>
                FILE_TYPES_EXTENSIONS[key].includes(attachment.extension)
            ) || "file";

            const iconClass = FILE_TYPES_ICONS[extensionKey];
            const iconHtml =
                extensionKey === "image"
                    ? `<img src="${attachment.file}" alt="${attachment.alt}" class="img-fluid" />`
                    : `<i class="${iconClass}"></i>`;

            const attachmentHtml = `
                <div class="col-lg-3 col-xl-2">
                    <div class="file-man-box" data-item-id="${attachment.id}">
                        <a href="#" class="file-close"><i class="fa fa-times-circle"></i></a>
                        <div class="file-img-box">${iconHtml}</div>
                        <a href="${attachment.file}" class="file-download">
                            <i class="fa fa-download"></i>
                        </a>
                        <div class="file-man-title">
                            <h5 class="mb-0 text-overflow">${attachment.name}</h5>
                            <p class="mb-0"><small>${this.formatFileSize(attachment.size)}</small></p>
                        </div>
                    </div>
                </div>
            `;
            this.attachmentsGrid.append(attachmentHtml);
        });
    }

    openModal(config = {}) {
        this.state.modal = {...this.state.modal, ...config, open: true};
        if (this.state.modal.useSelectAttachment) {
            this.attachmentsGrid.addClass("use-selection");
            this.selectionConfirmButton.attr("disabled", true);
        } else {
            this.attachmentsGrid.removeClass("use-selection");
            this.selectionConfirmButton.attr("disabled", false);
        }
        this.modalElement.modal("show");
        if (!this.state.modal.useSelectAttachment) {
            this.selectionConfirmButton.css("display", "none");
        }
    }

    closeModal() {
        this.state.modal.open = false;
        this.modalElement.modal("hide");
    }

    confirmSelection() {
        if (this.state.modal.onSelect) {
            this.state.modal.onSelect(this.state.modal.currentSelection);
        }
        this.closeModal();
    }

    selectAttachmentCard(attachment) {
        if (this.state.modal.currentSelection) {
            $(`.attachments-list .attachments-list-grid .file-man-box[data-item-id=${this.state.modal.currentSelection.id}]`).removeClass("selected");
        }
        const card_el = $(`.attachments-list .attachments-list-grid .file-man-box[data-item-id=${attachment.id}]`);
        if (this.state.modal.currentSelection) {
            if (this.state.modal.currentSelection.id === attachment.id) {
                this.selectionConfirmButton.attr("disabled", true);
                this.state.modal.currentSelection = null;
                return;
            }
        }
        card_el.addClass("selected");
        this.state.modal.currentSelection = this.state.attachmentsList.data.find(function (item) {
            return item.id === attachment.id;
        });
        if (this.state.modal.currentSelection) {
            this.selectionConfirmButton.attr("disabled", false);
        } else {
            this.selectionConfirmButton.attr("disabled", true);
        }
    }

    fetchActionRelatedObject(config, callbacks = {
        success: null,
    }) {
        const formData = new FormData();
        formData.append('content_type', this.api.content_type);
        formData.append('object_id', this.api.object_id);
        formData.append('attachment_type', config.attachment_type);
        formData.append('to_model_field_name', config.to_model_field_name);
        formData.append('action', config.action);
        formData.append('obj_id', config.obj_id);
        $.ajax({
            url: this.api.action.apiUrl,
            type: 'POST',
            data: formData,
            dataType: 'JSON',
            mimeType: "multipart/form-data",
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            error: function () {
            },
            success: function (response) {
                if (callbacks.success) {
                    callbacks.success(response);
                }
            }
        });
    }
}