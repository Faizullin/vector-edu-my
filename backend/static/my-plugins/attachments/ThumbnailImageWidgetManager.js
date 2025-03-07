class ThumbnailImageWidget {
    constructor(container, api, attachmentsManager) {
        this.container = container;
        this.api = api;
        this.attachmentsManager = attachmentsManager;

        this.inputElement = this.container.find(".thumbnail-attachment-field");
        this.uploadButton = this.container.find(".thumbnail-upload-btn");
        this.removeButton = this.container.find(".thumbnail-remove-btn");
        this.fromAttachmentsButton = this.container.find(".thumbnail-from-attachments-btn");
        this.imagePreviewContainer = this.container.find(".thumbnail-image-preview-container");
        this.imagePreview = this.imagePreviewContainer.find(".thumbnail-image-preview-img");
        this.widgetIdBase = this.inputElement.data("widget-id-base");

        this.formState = {
            uploadAttachmentFile: null,
            currentValue: null,
        };

        this.initialize();
    }

    initialize() {
        this.uploadButton.prop("disabled", true);
        this.removeButton.prop("disabled", true);
        const self = this;

        const initial_input_value = this.inputElement.val();
        if (initial_input_value) {
            if (!!Number(initial_input_value)) {
                const data = this.inputElement.data();
                this.setInputValue(data)
            }
        }

        // Event: Open attachments modal
        this.fromAttachmentsButton.on("click", () => {
            this.attachmentsManager.openModal({
                useSelectAttachment: true,
                currentThumbnailImageWidget: this,
                onSelect: function (new_attachment_obj) {
                    self.attachmentsManager.fetchActionRelatedObject({
                        attachment_type: "thumbnail_image",
                        to_model_field_name: "thumbnail",
                        action: "attach_related_single",
                        obj_id: new_attachment_obj.id,
                    }, {
                        success: function (response) {
                            const data = new_attachment_obj;
                            if (!data.url) {
                                data.url = data.file;
                            }
                            self.setInputValue(data);
                            self.attachmentsManager.closeModal();
                        }
                    });
                },
            });
            this.attachmentsManager.loadAttachments({});
        });


        this.container_dz_el = this.imagePreviewContainer.dropzone({
            url: self.api.upload.apiUrl,
            maxFiles: 1,
            acceptedFiles: "image/*",
            addRemoveLinks: !0,
            autoProcessQueue: false,
            init: function () {
                let files = 0
                this.on("addedfile", function (file) {
                    files++
                    if (!self.formState.uploadAttachmentFile && files === 1) {
                        self.formState.uploadAttachmentFile = file;
                        self.imagePreview.removeClass("active");
                        self.uploadButton.prop("disabled", false);
                    }
                })
                this.on('removedfile', function (file) {
                    files--
                    if (files === 0) {
                        self.formState.uploadAttachmentFile = null;
                        self.imagePreview.addClass("active");
                        self.uploadButton.prop("disabled", true);
                    }
                });
            },
        });
        this.uploadButton.on("click", function () {
            self.fetchSaveRelatedObjectThumbnail({
                success: function (response) {
                    self.container_dz_el[0].dropzone.removeAllFiles();
                }
            });
        });
        this.imagePreview.on("click", function () {
            if (self.imagePreview[0].classList.contains("active")) {
                self.container_dz_el[0].dropzone.hiddenFileInput.click();
            }
        });
        // Event: Remove selected thumbnail
        this.removeButton.on("click", function () {
            self.attachmentsManager.fetchActionRelatedObject({
                attachment_type: "thumbnail_image",
                to_model_field_name: "thumbnail",
                action: "detach_related_single",
                obj_id: self.inputElement.data("id"),
            }, {
                success: function () {
                    self.clearInputValue();
                }
            });
        });
    }

    setInputValue(attachment = {}) {
        const value = {
            id: attachment.id || "",
            name: attachment.name || "",
            url: attachment.url || "",
            alt: attachment.alt || "",
        };
        this.inputElement.val(value.id).data(value);
        this.imagePreview.attr({src: value.url, alt: value.alt}).toggleClass("active", !!value.url);
        this.removeButton.prop("disabled", !value.id);
        this.formState.currentValue = value.id;
    }

    clearInputValue() {
        this.setInputValue({});
    }

    getCurrentValue() {
        return this.formState.currentValue;
    }

    fetchSaveRelatedObjectThumbnail(callbacks = {
        success: null,
    }) {
        const self = this
        const formData = new FormData();
        formData.append('content_type', self.api.content_type);
        formData.append('object_id', self.api.object_id);
        formData.append('attachment_type', "thumbnail_image");
        formData.append('file', self.formState.uploadAttachmentFile);
        formData.append('to_model_field_name', "thumbnail");
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
            },
            success: function (response) {
                if (!response.url) {
                    response.url = response.file;
                }
                self.setInputValue(response);
                self.formState.uploadAttachmentFile = null;
                self.imagePreview.addClass("active");
                self.uploadButton.prop("disabled", true);
                if (callbacks.success) {
                    callbacks.success(response);
                }
            }
        });
    }
}

class ThumbnailImageWidgetManager {
    constructor(containers, api) {
        this.api = api;
        this.attachmentsManager = window.managers.attachmentModal;
        this.widgets = [];

        // Create a `ThumbnailImageWidget` instance for each container
        containers.each((index, container) => {
            const widget = new ThumbnailImageWidget($(container), this.api, this.attachmentsManager);
            this.widgets.push(widget);
        });
    }
}