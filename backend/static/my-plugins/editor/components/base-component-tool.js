class BaseComponentTool {
    static get toolbox() {
        return {
            title: 'Base Component',
        };
    }

    constructor({data, api}) {
        this.api = api;
        this.data = {
            data: data.data,
            obj: data.obj || null,
        };
        this.wrapper = undefined
        this.use_edit_model = true;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('base-component-wrapper');

        const spandEl = document.createElement('span');
        spandEl.innerText = this._getComponentTitle();
        spandEl.classList.add("component-title");
        this.wrapper.appendChild(spandEl);
        if (this.use_edit_model) {
            const editButton = this._getNewEditButtonEl();
            editButton.onclick = () => {
                this._openModal();
            };
            this.wrapper.appendChild(editButton);
        }

        return this.wrapper;
    }

    _openModal() {
        throw new Error('Not implemented');
    }

    _getComponentTitle() {
        return 'Base Component';
    }

    _getNewEditButtonEl() {
        const editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        ['edit-button', 'btn', 'btn-primary', 'btn-sm', "ms-2"].forEach((className) => {
            editButton.classList.add(className);
        });
        return editButton;
    }

    save() {
        return {
            data: this.data.data,
            obj: this.data.obj,
        }
    }
}