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
import { VideoIcon } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import { useBlockImportDialog } from "../hooks";
import type { ComponentBase } from "../types";
import { getTruncatedText } from "../utils";

export interface VideoComponent extends ComponentBase {
  description: string;
  video_url: string;
  embedded_video_url?: string;
}

const type = "video";

const parseSearchResponse = (response: any) =>
  response.results.map((item: any) => ({
    label: `${getTruncatedText(item.description, 40)} [#${item.id}]`,
    value: `${item.id}`,
  }));

export const VideoBlock = createBlockSpec<VideoComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Video",
    subtext: "Embed a video by URL",
    icon: (props) => <VideoIcon size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Video",
    parseSearchResponse,
    parseObjToValues: (obj) => ({
      description: obj.description,
      video_url: obj.video_url,
    }),
  }),
  render: ({ block }) => {
    const { obj } = block.data;
    const videoPreview = useMemo(() => {
      if (!obj) return null;
      return (
        <iframe
          src={obj.embedded_video_url!}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Video Preview"
        />
      );
    }, [obj]);

    const { showDialog } = useBlockImportDialog<VideoComponent>(block.id);
    const handleClick = useCallback(() => {
      if (obj) return;
      showDialog({ title: "Video", parseSearchResponse });
    }, [showDialog, obj]);

    return (
      <BlockCardWrapper block={block}>
        <div
          onClick={handleClick}
          className="relative w-full aspect-video flex items-center justify-center cursor-pointer group bg-muted"
        >
          {videoPreview || (
            <div className="text-muted-foreground text-sm">
              Click to insert video URL
            </div>
          )}
        </div>
        <div className="p-2 text-muted-foreground whitespace-pre-line">
          {block.data.obj?.description}
        </div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: { description: "Video description", video_url: "" },
    empty: { description: "", video_url: "" },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            description: z.string().min(1, "Required"),
            video_url: z.string().url("Must be a valid URL"),
          }),
        []
      );
      const formHook = useComponentBaseForm<VideoComponent, typeof formSchema>({
        schema: formSchema,
        apiService: createDefaultApiService<VideoComponent>({
          url: `/resources/component/video/`,
        }),
        queryKey: "components/video",
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: {
          description: "",
          video_url: "",
        },
        transformToApi: (data) => data,
        transformToForm: (data) => ({
          description: data.description,
          video_url: data.video_url,
        }),
        notifications: {
          onSuccess: (message) => showToast("success", { message }),
          onError: (message) => showToast("error", { message }),
        },
        onLoadSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              video_url: record.video_url,
              embedded_video_url: record.embedded_video_url,
            },
          });
        },
        onCreateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              video_url: record.video_url,
              embedded_video_url: record.embedded_video_url,
            },
          });
        },
        onUpdateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              video_url: record.video_url,
              embedded_video_url: record.embedded_video_url,
            },
          });
        },
      });
      const { showDialog } = useBlockImportDialog<VideoComponent>(block.id);
      const handleImportClick = useCallback(() => {
        showDialog({ title: "Video", parseSearchResponse });
      }, [showDialog]);
      useEffect(() => {
        if (block.data.values) {
          formHook.form.setValue(
            "description",
            block.data.values.description || ""
          );
          formHook.form.setValue(
            "video_url",
            block.data.values.video_url || ""
          );
        }
      }, [block.data.values]);

      const staticMode = block.data?.static || false;
      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
            <FormField
              control={formHook.form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/video"
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
                      placeholder="Description"
                      {...field}
                      disabled={staticMode}
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
