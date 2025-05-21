import type { DocumentBase } from "@/client";
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
import { useCustomToast } from "@/hooks/use-custom-toast";
import { ChevronDown, ChevronUp, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import type { ComponentBase } from "../types";

export interface FillTextLineDocument extends DocumentBase {
  text_before: string;
  answer: string;
  text_after: string;
  order: number;
}

export interface FillTextComponent extends ComponentBase {
  title: string;
  put_words: boolean;
  lines: FillTextLineDocument[];
}

const type = "fill-text";
const defaultValues = {
  title: "Fill in the blanks",
  put_words: true,
  lines: [
    {
      text_before: "The capital of France is",
      answer: "Paris",
      text_after: ".",
      order: 1,
    },
  ],
};

export const FillTextBlock = createBlockSpec<FillTextComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Fill Text",
    subtext: "Insert fill-in-the-blank sentences",
    icon: (props) => <PlusCircle size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Fill Text",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: `${item.title} [#${item.id}]`,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      title: obj.title,
      put_words: obj.put_words,
      lines: obj.lines,
    }),
  }),
  render: ({ block }) => (
    <BlockCardWrapper block={block}>
      <div className="space-y-2">
        <h4 className="font-semibold">{block.data.values?.title}</h4>
        <ul className="space-y-1 text-sm">
          {block.data.values?.lines
            ?.sort((a, b) => a.order - b.order)
            ?.map((line, i) => (
              <li key={i}>
                {line.text_before}{" "}
                <span className="font-bold underline">_____</span>{" "}
                {line.text_after}
              </li>
            ))}
        </ul>
      </div>
    </BlockCardWrapper>
  ),
  initialContent: {
    default: defaultValues,
    empty: {
      title: "",
      put_words: true,
      lines: [],
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const { showSuccessToast, showErrorToast } = useCustomToast();

      const formSchema = useMemo(
        () =>
          z.object({
            title: z.string().min(1, "Required"),
            put_words: z.boolean(),
            lines: z
              .array(
                z.object({
                  text_before: z.string().optional(),
                  answer: z.string().min(1, "Required"),
                  text_after: z.string().optional(),
                  order: z.coerce.number(),
                })
              )
              .min(1, "At least one line"),
          }),
        []
      );
      const currentDefaultValues = useMemo(() => block.data.values, [block.id]);
      const formHook = useComponentBaseForm<
        FillTextComponent,
        typeof formSchema
      >({
        schema: formSchema,
        apiService: createDefaultApiService<FillTextComponent>({
          url: `/resources/component/fill-text`,
        }),
        queryKey: "components/fill-text",
        invalidateQueriesOnMutate: true,
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: currentDefaultValues,
        notifications: {
          onSuccess: (title) => showSuccessToast({ title, duration: 2000 }),
          onError: (title) => showErrorToast({ title, duration: 2000 }),
        },
        onCreateSuccess: (record) =>
          updateBlockField(block.id, { ...block.data, obj: record }),
        onUpdateSuccess: (record) =>
          updateBlockField(block.id, { ...block.data, obj: record }),
        onLoadSuccess: (record) =>
          updateBlockField(block.id, { ...block.data, obj: record }),
      });

      const watchedValues = useWatch({
        control: formHook.form.control,
        name: ["title", "put_words", "lines"],
      });

      useEffect(() => {
        if (!watchedValues) return;
        updateBlockField(block.id, {
          ...block.data,
          values: {
            title: watchedValues[0],
            put_words: watchedValues[1],
            lines: watchedValues[2],
          },
        } as any);
      }, [watchedValues, updateBlockField]);

      const addLine = useCallback(() => {
        const current = formHook.form.getValues("lines") || [];
        formHook.form.setValue("lines", [
          ...current,
          {
            text_before: "",
            answer: "",
            text_after: "",
            order: current.length + 1,
          },
        ]);
      }, [formHook.form]);

      const recalculateOrders = (elements: any[]) => {
        return elements.map((el, index) => ({
          ...el,
          order: index + 1,
        }));
      };

      const removeLine = useCallback(
        (index: number) => {
          const current = formHook.form.getValues("lines") || [];
          current.splice(index, 1);
          formHook.form.setValue("lines", [...current]);
        },
        [formHook.form]
      );

      const moveElementUp = useCallback(
        (index: number) => {
          if (index === 0) return;
          const elements = [...formHook.form.getValues("lines")];
          [elements[index - 1], elements[index]] = [
            elements[index],
            elements[index - 1],
          ];
          formHook.form.setValue("lines", recalculateOrders(elements), {
            shouldDirty: true,
            shouldTouch: true,
          });
        },
        [formHook.form]
      );

      const moveElementDown = useCallback(
        (index: number) => {
          const elements = [...formHook.form.getValues("lines")];
          if (index >= elements.length - 1) return;
          [elements[index + 1], elements[index]] = [
            elements[index],
            elements[index + 1],
          ];
          formHook.form.setValue("lines", recalculateOrders(elements), {
            shouldDirty: true,
            shouldTouch: true,
          });
        },
        [formHook.form]
      );

      const staticMode = block.data?.static || false;

      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
            <FormField
              control={formHook.form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title"
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
              name="put_words"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(val) => field.onChange(Boolean(val))}
                    disabled={staticMode}
                  />
                  <FormLabel>Put word (instead of blank)</FormLabel>
                </FormItem>
              )}
            />

            <FormLabel>Lines</FormLabel>
            {formHook.form.watch("lines")?.map((_, i, arr) => (
              <div
                key={i}
                className="flex items-center gap-2 mb-2 border p-2 rounded"
              >
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={formHook.form.control}
                    name={`lines.${i}.text_before`}
                    render={({ field }) => (
                      <Input
                        placeholder="Text before"
                        {...field}
                        disabled={staticMode}
                      />
                    )}
                  />
                  <FormField
                    control={formHook.form.control}
                    name={`lines.${i}.answer`}
                    render={({ field }) => (
                      <Input
                        placeholder="Answer"
                        className="border-blue-500"
                        {...field}
                        disabled={staticMode}
                      />
                    )}
                  />
                  <FormField
                    control={formHook.form.control}
                    name={`lines.${i}.text_after`}
                    render={({ field }) => (
                      <Input
                        placeholder="Text after"
                        {...field}
                        disabled={staticMode}
                      />
                    )}
                  />
                </div>
                <div className="flex gap-1 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveElementUp(i)}
                    disabled={staticMode || i === 0}
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveElementDown(i)}
                    disabled={staticMode || i === arr.length - 1}
                  >
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(i)}
                    disabled={staticMode}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addLine}
              size={"sm"}
              disabled={staticMode}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Line
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
