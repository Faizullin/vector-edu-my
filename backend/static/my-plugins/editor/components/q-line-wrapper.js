class QLineWrapperAddFillInQuestionInlineTool {
    static get isInline() {
        return true;
    }
    
    constructor({api}) {
        this.api = api;
        this.button = null;
    }

    surround(range) {
        console.log('surround', this.state, range);
        if (this.state) {
            // If highlights is already applied, do nothing for now
            return;
        }

        // const selectedText = range.extractContents();

        // // Create MARK element
        // const mark = document.createElement('MARK');

        // // Append to the MARK element selected TextNode
        // mark.appendChild(selectedText);

        // // Insert new element
        // range.insertNode(mark);
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.textContent = 'M';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }
}



class QLineWrapper {
    static get toolbox() {
        return {
            title: 'Q Line Wrapper',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        };
    }

    constructor({ data, api }) {
        this.api = api;
        this.data = {
            text: data.text || '',
            blocks: data.blocks || []
        };
        this.wrapper = undefined;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('qline-wrapper');

        const textLine = document.createElement('div');
        textLine.contentEditable = true;
        textLine.classList.add('qline-text');
        textLine.innerHTML = this.data.text;
        textLine.addEventListener('input', () => {
            this.data.text = textLine.innerHTML;
        });

        return this.wrapper;
    }



    save(blockContent) {
        console.log('save', blockContent, this.data);
        return this.data;
    }
}
