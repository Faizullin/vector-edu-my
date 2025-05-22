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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { AudioLines, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import { useBlockImportDialog } from "../hooks";
import type { ComponentBase } from "../types";
import { getProtectedUrl } from "../utils";

interface AudioComponent extends ComponentBase {
  title: string;
  audio: {
    url: string;
  } | null;
}

const type = "audio";
const defaultValues = {
  title: "Audio title",
};

export const AudioBlock = createBlockSpec<AudioComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Audio",
    subtext: "Insert an audio file",
    icon: (props) => <AudioLines size={18} {...props} />,
    onItemClick: () => addBlock(type),
  }),
  sideMenu: () => ({
    title: "Audio",
    parseSearchResponse: (response) =>
      response.results.map((item) => ({
        label: `${item.title} [#${item.id}]`,
        value: `${item.id}`,
      })),
    parseObjToValues: (obj) => ({
      title: obj.title,
    }),
  }),
  render: ({ block }) => {
    const { obj } = block.data;
    const preview_url = useMemo(() => {
      if (obj?.audio?.url) {
        return getProtectedUrl(obj.audio.url);
      }
      return null;
    }, [obj]);
    const { showDialog } = useBlockImportDialog<AudioComponent>(block.id);

    const handleClick = useCallback(() => {
      if (obj) return;
      showDialog({
        title: "Audio",
        parseSearchResponse: (response) =>
          response.results.map((item) => ({
            label: item.title,
            value: `${item.id}`,
          })),
      });
    }, [showDialog, obj]);

    return (
      <BlockCardWrapper block={block}>
        <div
          onClick={handleClick}
          className="flex items-center justify-center p-4 cursor-pointer group border border-dashed rounded-lg bg-muted"
        >
          {preview_url ? (
            <audio controls className="w-full">
              <source src={preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground text-center gap-1">
              <Upload className="w-8 h-8" />
              <p className="text-sm">Click to upload audio</p>
              <p className="text-xs">MP3, WAV (max. 5MB)</p>
            </div>
          )}
        </div>
        <div className="text-audio-content p-2">{block.data.obj?.title}</div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: {
      title: "",
      audio: null,
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const { showSuccessToast, showErrorToast } = useCustomToast();

      const schema = z.object({
        audio_file: z.instanceof(File).or(z.null()).optional(),
        title: z.string().min(1, "Title is required"),
      });

      const [preview, setPreview] = useState<string | null>(null);

      const formHook = useComponentBaseForm<AudioComponent, typeof schema>({
        schema,
        apiService: createDefaultApiService<AudioComponent>({
          url: `/resources/component/audio`,
        }),
        queryKey: "components/audio",
        invalidateQueriesOnMutate: true,
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: {
          title: "",
          audio_file: null,
        },
        notifications: {
          onSuccess: (title) => showSuccessToast({ title, duration: 2000 }),
          onError: (title) => showErrorToast({ title, duration: 2000 }),
        },
        transformToApi(data) {
          const formData = new FormData();
          formData.append("title", data.title);
          if (data.audio_file) {
            formData.append("audio_file", data.audio_file);
          }
          return formData;
        },
        transformToForm(data) {
          return {
            title: data.title,
            audio_file: null,
          };
        },
        onLoadSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              title: record.title,
              audio: record.audio ? { url: record.audio.url } : null,
            },
          });
        },
        onCreateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              title: record.title,
              audio: record.audio ? { url: record.audio.url } : null,
            },
          });
        },
        onUpdateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              title: record.title,
              audio: record.audio ? { url: record.audio.url } : null,
            },
          });
        },
      });

      const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            formHook.form.setValue("audio_file", file);
            setPreview(URL.createObjectURL(file));
          }
        },
        [formHook.form]
      );

      useEffect(() => {
        if (block.data.obj?.audio?.url) {
          setPreview(getProtectedUrl(block.data.obj.audio.url));
        }
      }, [block.data.obj]);

      const { showDialog } = useBlockImportDialog<AudioComponent>(block.id);
      const handleImportClick = () => {
        showDialog({
          title: "Audio",
          parseSearchResponse: (response) =>
            response.results.map((item) => ({
              label: item.title,
              value: `${item.id}`,
            })),
        });
      };
      useEffect(() => {
        if (block.data.values) {
          formHook.form.setValue("title", block.data.values.title || "");
        }
      }, [block.data.values]);
      const staticMode = block.data?.static || false;

      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
            <div className="space-y-1">
              <Label htmlFor="audio" className="text-sm">
                Audio
              </Label>
              <div className="relative">
                {preview && (
                  <audio controls className="w-full mb-2">
                    <source src={preview} />
                  </audio>
                )}
                <FormField
                  control={formHook.form.control}
                  name="audio_file"
                  render={({ field }) => (
                    <input
                      ref={field.ref}
                      type="file"
                      name={field.name}
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="w-full"
                      disabled={staticMode}
                    />
                  )}
                />
                <FormMessage />
              </div>
            </div>

            <FormField
              control={formHook.form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Title"
                      {...field}
                      disabled={staticMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={
                  formHook.form.formState.isSubmitting ||
                  staticMode
                }
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={handleImportClick}
                size="sm"
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
