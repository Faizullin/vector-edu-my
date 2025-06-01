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
import { showToast } from "@/utils/handle-server-error";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import { useBlockImportDialog, useContentEditProps } from "../hooks";
import type { ComponentBase } from "../types";
import { getTruncatedText } from "../utils";

export interface TextProComponent extends ComponentBase {
  title: string;
  text: string;
}

const type = "text-pro";
const parseSearchResponse = (response: any) =>
  response.results.map((item: any) => ({
    label: `${getTruncatedText(item.title, 40)} [#${item.id}]`,
    value: `${item.id}`,
  }));
const parseObjToValues = (obj: TextProComponent) => ({
  title: obj.title,
  text: obj.text,
});
const defaultValues = {
  title: "Title",
  text: "Text",
};
export const TextProBlock = createBlockSpec<TextProComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "TextPro",
    subtext: "Insert a text-pro",
    icon: (props) => <AlertCircle size={18} {...props} />,
    onItemClick: () => {
      addBlock(type);
    },
  }),
  sideMenu: () => ({
    title: "TextPro",
    parseSearchResponse,
    parseObjToValues,
  }),
  render: ({ block }) => {
    const contentTextProps = useContentEditProps("text", block, {
      nextControl: "next-block",
      fieldname: "1",
    });
    const titleContentProps = useContentEditProps("title", block, {
      nextControl: contentTextProps,
      fieldname: "0",
    });
    return (
      <BlockCardWrapper block={block}>
        <div className="space-y-2 border-l-4 border-blue-500 pl-3 py-1">
          <h3
            {...titleContentProps}
            className="text-lg font-semibold outline-none focus:ring-0 text-pro-title"
          />
          <div
            {...contentTextProps}
            className="outline-none focus:ring-0 text-pro-content whitespace-pre-line"
          />
        </div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: {
      title: "",
      text: "",
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            title: z.string().min(1, "Title is required"),
            text: z.string().min(1, "Text is required"),
          }),
        []
      );
      const formHook = useComponentBaseForm<
        TextProComponent,
        typeof formSchema
      >({
        schema: formSchema,
        apiService: createDefaultApiService<TextProComponent>({
          url: `/resources/component/text-pro`,
        }),
        queryKey: "components/text-pro",
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: {
          title: "",
          text: "",
        },
        transformToApi: (data) => data,
        transformToForm: (data) => ({
          title: data.title,
          text: data.text,
        }),
        notifications: {
          onSuccess: (message) => showToast("success", { message }),
          onError: (message) => showToast("error", { message }),
        },
        onLoadSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            values: parseObjToValues(record),
            obj: {
              id: record.id,
              title: record.title,
              text: record.text,
            },
          });
        },
        onCreateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            values: parseObjToValues(record),
            obj: {
              id: record.id,
              title: record.title,
              text: record.text,
            },
          });
        },
        onUpdateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            values: parseObjToValues(record),
            obj: {
              id: record.id,
              title: record.title,
              text: record.text,
            },
          });
        },
      });
      const { showDialog } = useBlockImportDialog<TextProComponent>(block.id);
      const handleImportClick = useCallback(() => {
        showDialog({ title: "Video", parseSearchResponse });
      }, [showDialog]);
      useEffect(() => {
        if (block.data.values) {
          formHook.form.setValue("title", block.data.values.title || "");
          formHook.form.setValue("text", block.data.values.text || "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [block.data.values]);
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
                    <Input {...field} disabled={staticMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formHook.form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={staticMode}
                      placeholder="Enter text"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={formHook.form.formState.isSubmitting || staticMode}
                size={"sm"}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleImportClick}
                size={"sm"}
              >
                Import
              </Button>
            </div>
          </Form>
        </form>
      );
    },
  },
});
