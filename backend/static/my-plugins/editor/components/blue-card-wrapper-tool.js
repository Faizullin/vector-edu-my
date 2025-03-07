class BlueCardWrapperTool {
    static get toolbox() {
        return {
            title: 'Blue Card',
        };
    }

    constructor({ data, api }) {
        this.api = api;
        this.data = {
            text: data.text || '',
        };
        this.wrapper = undefined;
    }


    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('blue-card-wrapper');
        this.wrapper.innerHTML = this.data.text || "Blue Card";
        this.wrapper.contentEditable = true;
        this.wrapper.addEventListener('input', () => {
            this.data.text = this.wrapper.innerHTML;
        });
        return this.wrapper;
    }



    save(blockContent) {
        return this.data;
    }
}