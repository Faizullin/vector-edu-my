class QuestionComponentTool extends BaseComponentTool {
    static get toolbox() {
        return {
            title: 'Question Component',
        };
    }

    constructor(props) {
        super(props)
    }

    _getComponentTitle() {
        let str = "Question Component";
        if (this.data && this.data.obj) {
            const question_text = this.data.obj.text.length > 20 ? this.data.obj.text.substring(0, 20) + "..." : this.data.obj.text;
            str += `: [${this.data.obj.id}] ${question_text}`;
        }
        return str;
    }

    _openModal() {
        const obj = this.data.obj;
        const self = this;
        window.managers.componentEditorModal.openModal({
            type: "question",
            obj: obj,
            onSuccess: (response) => {
                if (response.success) {
                    self.data.obj = response.data.instance;
                    self.wrapper.querySelector(".component-title").innerText = self._getComponentTitle();
                }
            }
        });
    }
}