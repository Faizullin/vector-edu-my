import type { DocumentBase } from "@/client";
import {
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import { Button } from "@/components/ui/button";
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

export interface OrderElementDocument extends DocumentBase {
  text: string;
  order: number;
}

export interface OrderComponent extends ComponentBase {
  title: string;
  elements: OrderElementDocument[];
}

const type = "order";
const defaultValues = {
  title: "Put in order",
  elements: [
    { text: "Step 1", order: 1 },
    { text: "Step 2", order: 2 },
  ],
};

export const OrderBlock = createBlockSpec<OrderComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Order",
    subtext: "Insert steps to put in order",
    icon: (props) => <PlusCircle size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Order",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: `${item.title} [#${item.id}]`,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      title: obj.title,
      elements: obj.elements,
    }),
  }),
  render: ({ block }) => (
    <BlockCardWrapper block={block}>
      <div className="space-y-2">
        <h4 className="font-semibold">{block.data.values?.title}</h4>
        <ol className="list-decimal list-inside text-sm">
          {block.data.values?.elements
            ?.sort((a, b) => a.order - b.order)
            .map((el, i) => <li key={i}>{el.text}</li>)}
        </ol>
      </div>
    </BlockCardWrapper>
  ),
  initialContent: {
    default: defaultValues,
    empty: {
      title: "",
      elements: [],
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const { showSuccessToast, showErrorToast } = useCustomToast();

      const formSchema = useMemo(
        () =>
          z.object({
            title: z.string().min(1, "Required"),
            elements: z
              .array(
                z.object({
                  text: z.string().min(1, "Required"),
                  order: z.coerce.number(),
                })
              )
              .min(1, "At least one element"),
          }),
        []
      );

      const currentDefaultValues = useMemo(() => block.data.values, [block.id]);
      const formHook = useComponentBaseForm<OrderComponent, typeof formSchema>({
        schema: formSchema,
        apiService: createDefaultApiService<OrderComponent>({
          url: `/resources/component/order/`,
        }),
        queryKey: "components/order",
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
        name: ["title", "elements"],
      });

      useEffect(() => {
        if (!watchedValues) return;
        updateBlockField(block.id, {
          ...block.data,
          values: {
            title: watchedValues[0],
            elements: watchedValues[1],
          },
        } as any);
      }, [watchedValues, updateBlockField]);

      const recalculateOrders = (
        elements: { text: string; order: number }[]
      ) => {
        return elements.map((el, index) => ({
          ...el,
          order: index + 1,
        }));
      };

      const removeElement = useCallback(
        (index: number) => {
          const current = [...formHook.form.getValues("elements")];
          current.splice(index, 1);
          formHook.form.setValue("elements", recalculateOrders(current));
        },
        [formHook.form]
      );

      const addElement = useCallback(() => {
        const current = formHook.form.getValues("elements") || [];
        const newList = [...current, { text: "", order: current.length + 1 }];
        formHook.form.setValue("elements", recalculateOrders(newList));
      }, [formHook.form]);

      const moveElementUp = useCallback(
        (index: number) => {
          if (index === 0) return;
          const elements = [...formHook.form.getValues("elements")];
          [elements[index - 1], elements[index]] = [
            elements[index],
            elements[index - 1],
          ];
          formHook.form.setValue("elements", recalculateOrders(elements), {
            shouldDirty: true,
            shouldTouch: true,
          });
        },
        [formHook.form]
      );

      const moveElementDown = useCallback(
        (index: number) => {
          const elements = [...formHook.form.getValues("elements")];
          if (index >= elements.length - 1) return;
          [elements[index + 1], elements[index]] = [
            elements[index],
            elements[index + 1],
          ];
          formHook.form.setValue("elements", recalculateOrders(elements), {
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

            <FormLabel>Elements</FormLabel>
            {formHook.form.watch("elements")?.map((_, i, arr) => (
              <div
                key={i}
                className="flex flex-col gap-2 mb-2 border p-3 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <FormField
                      control={formHook.form.control}
                      name={`elements.${i}.text`}
                      render={({ field }) => (
                        <Input
                          placeholder="Text"
                          {...field}
                          disabled={staticMode}
                        />
                      )}
                    />
                    <FormField
                      control={formHook.form.control}
                      name={`elements.${i}.order`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          placeholder="Order"
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
                      onClick={() => removeElement(i)}
                      disabled={staticMode}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addElement}
              size="sm"
              disabled={staticMode}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Element
            </Button>

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={formHook.form.formState.isSubmitting || staticMode}
                size="sm"
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
