class ComponentDto {
    constructor(options) {
        this.name = options.name;
        this.obj = options.obj;
        this.steps = options.steps;
        this.current_step = options.current_step;
        this.onSuccess = options.onSuccess;
    }
}

class ComponentEditorModalManager {
    constructor(options) {
        if (!options.holder) {
            throw new Error("Holder element is required");
        }
        this.currentConfig = null;
        this.loadingStates = {};

        this.modalEl = options.holder
        this.formContainerEl = this.modalEl.find(".form-container");
        this.tabsEl = this.modalEl.find(".tabs");

        this.init();
    }


    getComponentsConfig() {
        return [
            {
                name: "question",
                title: "Question Component",
                steps: ["main", "answers"],
            }
        ]
    }

    openModal({type, obj, onSuccess}) {
        const config = this.getComponentsConfig().find(function (el) {
            return el.name === type;
        });
        if (!config) {
            throw new Error("Invalid component type");
        }
        const self = this;
        self.modalEl.modal("show");
        const currentStep = "main";
        this._loadForm({
            config: config,
            obj: obj,
            step: currentStep,
            onSuccess: function (response) {
                if (response.success) {
                    self.currentConfig = new ComponentDto({
                        name: config.name,
                        obj: response.data.instance || null,
                        steps: response.data.steps,
                        current_step: currentStep,
                        onSuccess: onSuccess,
                    });
                    self._updateTabs(self.currentConfig.steps, self.currentConfig.current_step);
                    if (data.name === "question") {
                        window.managers.questionEditManager.initNewForm({
                            holder: $(".multichoice-form-wrapper"),
                        });
                    }
                }
            }
        });
    }

    _loadForm(options) {
        const self = this;
        const componentName = options.config.name;
        if (this.loadingStates[componentName]) return;
        this.loadingStates[componentName] = true;
        const data = {
            step: options.step,
            name: componentName,
            action: "component-form-load",
        };
        if (options.obj) {
            data.obj_id = options.obj.id;
        }
        const action_url = window.managers.urlFormatter.formatNotReadyUrl(window.server_conf.editor_data.baseApiUrl, data);
        $.ajax({
            url: action_url,
            type: "GET",
            success: (response) => {
                if (response.success) {
                    self.formContainerEl.html(response.data.form);
                } else {
                    self.formContainerEl.html(`<div class="alert alert-danger">${response.error}</div>`);
                }
                self.loadingStates[componentName] = false;
                if (options.onSuccess) {
                    options.onSuccess(response);
                }


            },
            error: () => {
                self.formContainerEl.html(`<div class="alert alert-danger">Error loading form</div>`);
                self.loadingStates[componentName] = false;
            }
        });
    }

    _handleFormSubmit(event) {
        event.preventDefault();
        let form = $(event.target);
        let formData = form.serialize();
        const self = this;
        const data = {
            step: self.currentConfig.current_step,
            name: self.currentConfig.name,
            action: "component-form-submit",
        };
        if (self.currentConfig.obj) {
            data.obj_id = self.currentConfig.obj.id;
        }
        const action_url = window.managers.urlFormatter.formatNotReadyUrl(window.server_conf.editor_data.baseApiUrl, data);
        $.ajax({
            url: action_url,
            type: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
            },
            data: formData,
            success: (response) => {
                if (response.success) {
                    const data = response.data;
                    self.formContainerEl.html(data.form);
                    self.currentConfig.steps = data.steps;
                    self._updateTabs(self.currentConfig.steps, self.currentConfig.current_step);
                    if (self.currentConfig.onSuccess) {
                        self.currentConfig.onSuccess(response);
                    }
                    self._loadForm({
                        config: self.currentConfig,
                        obj: self.currentConfig.obj,
                        step: self.currentConfig.current_step,
                        onSuccess: function (response) {
                            if (response.success) {
                                self.currentConfig.steps = response.data.steps;
                            }
                        }
                    });
                }
            },
            error: () => {
                alert("Error submitting form");
            }
        });
    }

    init() {
        $(document).on("click", ".tabs .nav-link", (e) => this._handleTabClick(e));
        $(document).on("submit", ".form-container", (e) => this._handleFormSubmit(e));
        $(document).on("click", ".submit-form-btn", () => $(".form-container").submit());
        if (this.currentConfig) {
            this._updateTabs(this.currentConfig.steps, this.currentConfig.current_step);
        } else {
            this._updateTabs(["main"], "main");
        }
    }

    _handleTabClick(event) {
        event.preventDefault();
        let newStep = $(event.target).data("step");

        if (newStep !== this.currentConfig.current_step) {
            this.currentConfig.current_step = newStep;
            this._updateTabs(this.currentConfig.steps, this.currentConfig.current_step);
            const self = this;
            this._loadForm({
                config: self.currentConfig,
                obj: self.currentConfig.obj,
                step: newStep,
                onSuccess: function (response) {
                    if (response.success) {
                        self.currentConfig.steps = response.data.steps;
                    }
                }
            });
        }
    }

    _updateTabs(steps, activeStep) {
        this.tabsEl.html("");
        const defaultSteps = {
            "main": "Main",
            "answers": "Answers",
        }
        steps.forEach((step) => {
            const active = step === activeStep;
            const label = defaultSteps[step] || step;
            let tab = $(`<li class="nav-item">
                <a class="nav-link ${active ? "active" : ""}" href="#" ${active ? "aria-current=\"page\"" : ""} data-step="${step}">${label}</a>
            </li>`);
            this.tabsEl.append(tab);
        });
    }
}