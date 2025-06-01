/* eslint-disable react-hooks/rules-of-hooks */

import {
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

export interface BluecardComponent extends ComponentBase {
  text: string;
}

const type = "bluecard";
const parseSearchResponse = (response: any) =>
  response.results.map((item: any) => ({
    label: `${getTruncatedText(item.text, 40)} [#${item.id}]`,
    value: `${item.id}`,
  }));
const parseObjToValues = (obj: BluecardComponent) => ({
  text: obj.text,
});
const defaultValues = {
  text: "Text",
};
export const BluecardBlock = createBlockSpec<BluecardComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Bluecard",
    subtext: "Insert a bluecard",
    icon: (props) => <AlertCircle size={18} {...props} />,
    onItemClick: () => {
      addBlock(type);
    },
  }),
  sideMenu: () => ({
    title: "Bluecard",
    parseSearchResponse,
    parseObjToValues,
  }),
  render: ({ block }) => {
    const contentBluecardps = useContentEditProps("text", block, {
      nextControl: "next-block",
      fieldname: "0",
    });
    return (
      <BlockCardWrapper block={block}>
        <Alert className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div
              {...contentBluecardps}
              className="outline-none focus:ring-0 text-bluecard-content"
            />
          </AlertDescription>
        </Alert>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: {
      text: "",
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            text: z.string().min(1, "Text is required"),
          }),
        []
      );
      const formHook = useComponentBaseForm<
        BluecardComponent,
        typeof formSchema
      >({
        schema: formSchema,
        apiService: createDefaultApiService<BluecardComponent>({
          url: `/resources/component/bluecard`,
        }),
        queryKey: "components/bluecard",
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: {
          text: "",
        },
        transformToApi: (data) => data,
        transformToForm: (data) => ({
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
              text: record.text,
            },
          });
        },
      });
      const { showDialog } = useBlockImportDialog<BluecardComponent>(block.id);
      const handleImportClick = useCallback(() => {
        showDialog({ title: "Video", parseSearchResponse });
      }, [showDialog]);
      useEffect(() => {
        if (block.data.values) {
          formHook.form.setValue("text", block.data.values.text || "");
        }
      }, [block.data.values]);
      const staticMode = block.data?.static || false;
      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
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
