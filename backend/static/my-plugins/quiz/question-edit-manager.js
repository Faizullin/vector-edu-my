class QuestionEditManager {
    constructor() {
        this.init();
    }

    init() {
        $(document).on("click", ".form-container .multichoice-form-wrapper .add-form-btn", function (e) {
            e.preventDefault();
            const formWrapper = $(this).closest(".multichoice-form-wrapper");
            const form = formWrapper.find(".formset-container");
            const emptyFormTemplate = formWrapper.find(".empty-form-template").html();
            const formCount = form.find(".option-formset-item").length;
            const newForm = emptyFormTemplate.replace(/__prefix__/g, formCount);
            form.append(newForm);
        });

        $(document).on("click", ".form-container .multichoice-form-wrapper .remove-form-btn", function (e) {
            e.preventDefault();
            const formWrapper = $(this).closest(".multichoice-form-wrapper");
            const form = formWrapper.find(".formset-container");
            const formCount = form.find(".option-formset-item").length;
            if (formCount > 1) {
                $(this).closest(".option-formset-item").remove();
            }
        });

        $(document).on("input", ".form-container .multichoice-form-wrapper .answer-text-field-container input", function (e) {
            const value = $(this).val();
            const headerText = $(this).closest(".option-formset-item").find(".answer-header-text");
            const truncated = value.length > 20 ? value.substring(0, 20) + "..." : value;
            headerText.text(truncated);
        });
    }

    initNewForm(config) {
        const formWrapper = config.holder;
        const form = formWrapper.find(".formset-container");
        const optionList = form.find(".option-formset-item");
        console.log("reinit again");
        optionList.each(function (index, item) {
            // i nned find form inside and rpelace with div tag
            const innerReplaceForm = $(item).find(".accordion-body > form");
            // I nned in innerReplaceForm change to div tag intead of initial form
            innerReplaceForm.replaceWith(function () {
                return $("<div>").append($(this).contents());
            });

            const headerText = $(item).find(".answer-header-text");
            const answerText = $(item).find(".answer-text-field-container input").val();
            const truncated = answerText.length > 20 ? answerText.substring(0, 20) + "..." : answerText;
            headerText.text(truncated);
        });
    }
}