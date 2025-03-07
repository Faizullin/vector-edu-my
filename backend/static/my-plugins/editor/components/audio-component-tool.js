class AudioComponentTool {
    static get toolbox() {
        return {
            title: 'Audio Component',
        };
    }

    constructor({data, api}) {
        this.api = api;
        this.data = {
            caption: data.caption || '',
            attachment: data.attachment || null,
        };
        this.wrapper = undefined
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('audio-component-wrapper');

        if (this.data && this.data.attachment) {
            this._createAudio(this.data.attachment);
            return this.wrapper;
        }

        this._openModal();
        return this.wrapper;
    }

    _openModal() {
        const self = this;
        window.managers.attachmentModal.openModal({
            useSelectAttachment: {
                mimeTypes: ['audio'],
            },
            onSelect: function (attachment_obj) {
                self.data.attachment = attachment_obj;
                self._createAudio(self.data.attachment);
                window.managers.attachmentModal.closeModal();
            }
        });
        window.managers.attachmentModal.loadAttachments();
    }

    _setEditButtonOnClick(editButton) {
        const self = this;
        editButton.onclick = () => {
            self._openModal();
        };
    }

    _createAudio(fileObject) {
        const existingAudio = this.wrapper.querySelector('audio');
        if (existingAudio) {
            existingAudio.src = fileObject.url || fileObject.file;
            return
        }
        const audio = document.createElement('audio');
        const caption = document.createElement('div');
        const editButton = document.createElement('button');

        audio.src = fileObject.url || fileObject.file;
        audio.controls = true;

        caption.contentEditable = true;
        caption.innerHTML = fileObject.alt || '';
        caption.classList.add('file-component-caption');

        editButton.innerHTML = 'Edit';
        ['edit-button', 'btn', 'btn-primary', 'btn-sm'].forEach((className) => {
            editButton.classList.add(className);
        });
        this._setEditButtonOnClick(editButton);

        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(audio);
        this.wrapper.appendChild(editButton);
        this.wrapper.appendChild(caption);

        return this.wrapper;
    }

    save(blockContent) {
        const caption = blockContent.querySelector('[contenteditable]');

        return {
            attachment: this.data.attachment,
            caption: caption.innerHTML,
        };
    }
}