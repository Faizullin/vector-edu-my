class RecordAudioComponentTool {
    static get toolbox() {
        return {
            title: 'Record Audio Component',
        };
    }

    constructor({data, api}) {
        this.api = api;
        this.data = {
            caption: data.caption || '',
        };
        this.wrapper = undefined
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('record-audio-component-wrapper');
        this.wrapper.innerHTML = `
            <div class="d-flex align-items-center border p-3 rounded">
              <input type="text" class="form-control flex-grow-1" placeholder="Speak to enter text..." />
              <button class="btn btn-outline-primary ms-2">
                <i class="bi bi-mic"></i>
              </button>
            </div>`;
        return this.wrapper;
    }

    save(blockContent) {
        const caption = blockContent.querySelector('input');

        return {
            caption: caption.innerHTML,
        };
    }
}