/* eslint-disable react-hooks/rules-of-hooks */
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
import { Textarea } from "@/components/ui/textarea";
import { DocumentBase } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { Mic } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { BlockCardWrapper } from "../components/block-card-wrapper";
import { createBlockSpec } from "../createBlockSpec";
import type { ComponentBase } from "../types";

export interface RecordAudioComponent extends DocumentBase, ComponentBase {
  title: string;
  description: string;
}

const type = "record-audio";
const defaultValues = {
  title: "Audio Note",
  description: "Record your thoughts here...",
};

export const RecordAudioBlock = createBlockSpec<RecordAudioComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Record Audio",
    subtext: "Capture audio with title and description",
    icon: (props) => <Mic size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Record Audio",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: `${item.title} [#${item.id}]`,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      title: obj.title,
      description: obj.description,
    }),
  }),
  render: ({ block }) => {
    const { title, description } = block.data.values ?? {};
    return (
      <BlockCardWrapper block={block}>
        <div className="p-4 space-y-2">
          <div className="font-bold text-lg">{title}</div>
          <div className="text-gray-700">{description}</div>
          <Button size="sm" variant="outline">
            <Mic className="mr-2" size={16} />
            Record
          </Button>
        </div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: { title: "", description: "" },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            title: z.string().min(1, "Title is required"),
            description: z.string().min(1, "Description is required"),
          }),
        []
      );
      const formHook = useComponentBaseForm<
        RecordAudioComponent,
        typeof formSchema
      >({
        schema: formSchema,
        apiService: createDefaultApiService<RecordAudioComponent>({
          url: `/resources/component/record-audio`,
        }),
        queryKey: "components/record-audio",
        invalidateQueriesOnMutate: true,
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: block.data.values,
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
        name: ["title", "description"],
      });

      useEffect(() => {
        if (!watchedValues) return;
        const [title, description] = watchedValues;
        updateBlockField(block.id, {
          ...block.data,
          values: { title, description },
        });
      }, [watchedValues, updateBlockField]);

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
                      placeholder="Enter title..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description..."
                      {...field}
                      disabled={staticMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
