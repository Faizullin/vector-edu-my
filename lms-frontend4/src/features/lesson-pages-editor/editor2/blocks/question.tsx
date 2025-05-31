import type { DocumentBase } from "@/types";
import {
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import type { ComponentBase } from "../types";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import { showToast } from "@/utils/handle-server-error";

export interface QuestionAnswer extends DocumentBase {
  text: string;
  is_correct: boolean;
}

export interface QuestionComponent extends ComponentBase {
  text: string;
  answers: QuestionAnswer[];
}

const type = "question";
const defaultValues = {
  text: "Enter your question",
  answers: [
    { text: "Option A", is_correct: true },
    { text: "Option B", is_correct: false },
  ],
};

export const QuestionBlock = createBlockSpec<QuestionComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Question",
    subtext: "Multiple choice block",
    icon: (props) => <PlusCircle size={18} {...props} />,
    onItemClick: () => {
      addBlock(type);
    },
  }),
  sideMenu: () => ({
    title: "Question",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: `${item.text} [#${item.id}]`,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      text: obj.text,
      answers: obj.answers,
    }),
  }),
  render: ({ block }) => {
    const { text, answers } = block.data.values ?? {};
    return (
      <BlockCardWrapper block={block}>
        <div className="p-4 space-y-3">
          <p className="font-medium">{text}</p>
          <ul className="space-y-1">
            {answers?.map((answer, i) => (
              <li
                key={i}
                className={`p-2 rounded ${
                  answer.is_correct ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {answer.text}
              </li>
            ))}
          </ul>
        </div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: {
      text: "",
      answers: [],
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            text: z.string().min(1, "Question is required"),
            answers: z
              .array(
                z.object({
                  text: z.string().min(1, "Answer text required"),
                  is_correct: z.boolean(),
                })
              )
              .min(1, "At least one answer"),
          }),
        []
      );

      const currentDefaultValues = useMemo(() => block.data.values, [block.id]);
      const formHook = useComponentBaseForm<
        QuestionComponent,
        typeof formSchema
      >({
        schema: formSchema,
        apiService: createDefaultApiService<QuestionComponent>({
          url: `/resources/component/question`,
        }),
        queryKey: "components/question",
        invalidateQueriesOnMutate: true,
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: currentDefaultValues,
        transformToForm: (data) => data,
        notifications: {
          onSuccess: (message) => showToast("success", { message }),
          onError: (message) => showToast("error", { message }),
        },
        onCreateSuccess(record) {
          updateBlockField(block.id, { ...block.data, obj: record });
        },
        onUpdateSuccess(record) {
          updateBlockField(block.id, { ...block.data, obj: record });
        },
        onLoadSuccess(record) {
          updateBlockField(block.id, { ...block.data, obj: record });
        },
      });

      const watchedValues = useWatch({
        control: formHook.form.control,
        name: ["text", "answers"], // specify the fields you want to watch
      });

      useEffect(() => {
        if (!watchedValues) return;
        const [text, answers] = watchedValues;
        updateBlockField(block.id, {
          ...block.data,
          values: {
            text,
            answers: answers,
          },
        } as any);
      }, [watchedValues, updateBlockField]);

      const addAnswer = useCallback(() => {
        const current = formHook.form.getValues("answers") || [];
        formHook.form.setValue("answers", [
          ...current,
          { text: "", is_correct: false },
        ]);
      }, [formHook.form]);

      const removeAnswer = useCallback(
        (index: number) => {
          const current = formHook.form.getValues("answers") || [];
          current.splice(index, 1);
          formHook.form.setValue("answers", [...current]);
        },
        [formHook.form]
      );

      const staticMode = block.data?.static || false;

      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
            <FormField
              control={formHook.form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Question..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormLabel>Answers</FormLabel>
            {formHook.form.watch("answers")?.map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <FormField
                  control={formHook.form.control}
                  name={`answers.${i}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Answer ${i + 1}`}
                          {...field}
                          disabled={staticMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formHook.form.control}
                  name={`answers.${i}.is_correct`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(val) => field.onChange(Boolean(val))}
                        disabled={staticMode}
                      />
                      <FormLabel className="text-sm">Correct</FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  onClick={() => removeAnswer(i)}
                  disabled={staticMode}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addAnswer}
              disabled={staticMode}
              size={"sm"}
            >
              <PlusCircle className="mr-2 h-3 w-3" /> Add Answer
            </Button>

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={formHook.form.formState.isSubmitting || staticMode}
                size={"sm"}
              >
                Save
              </Button>
            </div>
          </Form>
        </form>
      );
    },
  },
});
