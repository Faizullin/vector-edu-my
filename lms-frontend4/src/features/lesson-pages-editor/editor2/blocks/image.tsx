import type { PaginatedData } from "@/types";
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
import { ImageIcon, PlusCircle, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { BlockCardWrapper } from "../components/BlockCardWrapper";
import { createBlockSpec } from "../createBlockSpec";
import { useBlockImportDialog } from "../hooks";
import type { ComponentBase } from "../types";
import { getProtectedUrl, getTruncatedText } from "../utils";
import { showToast } from "@/utils/handle-server-error";

export interface ImageComponent extends ComponentBase {
  description: string;
  image: {
    url: string;
  } | null;
}
const type = "image";
const parseSearchResponse = (response: PaginatedData<ImageComponent>) =>
  response.results.map((item) => ({
    label: `${getTruncatedText(item.description, 40)} [#${item.id}]`,
    value: `${item.id}`,
  }));
const parseObjToValues = (obj: ImageComponent) => {
  const data: any = {
    description: obj.description,
  };
  return data;
};
const defaultValues = {
  description: "Description",
};
export const ImageBlock = createBlockSpec<ImageComponent>({
  type,
  suggestionMenu: ({ addBlock }) => ({
    title: "Image",
    subtext: "Insert a image",
    icon: (props) => <ImageIcon size={18} {...props} />,
    onItemClick: () => {
      addBlock(type);
    },
  }),
  sideMenu: () => ({
    title: "Image",
    parseSearchResponse,
    parseObjToValues,
  }),
  render: ({ block }) => {
    const { obj } = block.data;
    const preview_image_url = useMemo(() => {
      if (obj?.image?.url) {
        return getProtectedUrl(obj.image.url);
      }
      return null;
    }, [obj]);
    const { showDialog } = useBlockImportDialog<ImageComponent>(block.id);
    const handleClick = useCallback(() => {
      if (obj) {
        return;
      }
      showDialog({
        title: "Image",
        parseSearchResponse,
      });
    }, [showDialog, obj]);
    return (
      <BlockCardWrapper block={block}>
        <div
          onClick={handleClick}
          className="relative w-full aspect-square flex items-center justify-center cursor-pointer group h-[200px] lg:h-[300px]"
        >
          {preview_image_url ? (
            <div className="relative w-full h-full">
              <img
                src={preview_image_url}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {/* <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                  //   onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button> */}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-6 border-2 border-dashed border-muted rounded-md m-4 group-hover:border-muted-foreground/50 transition-colors">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">Click to upload image</p>
              <p className="text-xs text-center">
                SVG, PNG, JPG or GIF (max. 2MB)
              </p>
            </div>
          )}
        </div>
        <div className="outline-none focus:ring-0 text-image-content p-2">
          {block.data.obj?.description}
        </div>
      </BlockCardWrapper>
    );
  },
  initialContent: {
    default: defaultValues,
    empty: {
      description: "",
      image_url: null,
    },
  },
  sidebar: {
    render: ({ block, updateBlockField }) => {
      const formSchema = useMemo(
        () =>
          z.object({
            image_file: z.instanceof(File).or(z.null()).optional(),
            description: z.string().min(1, "Description is required"),
          }),
        []
      );
      const [preview, setPreview] = useState<string | null>(null);
      const formHook = useComponentBaseForm<ImageComponent, typeof formSchema>({
        schema: formSchema,
        apiService: createDefaultApiService<ImageComponent>({
          url: `/resources/component/image`,
        }),
        queryKey: "components/image",
        invalidateQueriesOnMutate: true,
        initialMode: block.data.obj ? "edit" : "create",
        recordId: block.data.obj?.id || null,
        defaultValues: {
          description: "",
          image_file: null,
        },
        notifications: {
          onSuccess: (message) => showToast("success", { message }),
          onError: (message) => showToast("error", { message }),
        },
        transformToApi(data) {
          const formData = new FormData();
          formData.append("description", data.description);
          if (data.image_file) {
            formData.append("image_file", data.image_file);
          }
          return formData;
        },
        transformToForm(data) {
          return {
            description: data.description,
            image_file: null,
          };
        },
        onLoadSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              image: record.image
                ? {
                    url: record.image.url,
                  }
                : null,
            },
          } as any);
        },
        onCreateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              image: record.image
                ? {
                    url: record.image.url,
                  }
                : null,
            },
          });
        },
        onUpdateSuccess(record) {
          updateBlockField(block.id, {
            ...block.data,
            obj: {
              id: record.id,
              description: record.description,
              image: record.image
                ? {
                    url: record.image.url,
                  }
                : null,
            },
          });
        },
      });
      const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            formHook.form.setValue("image_file", file, {
              shouldDirty: true,
              shouldValidate: true,
              shouldTouch: true,
            });
            setPreview(URL.createObjectURL(file));
          }
        },
        [formHook.form]
      );
      const removeImage = useCallback(() => {
        formHook.form.setValue("image_file", null);
        setPreview(null);
      }, [formHook.form]);
      useEffect(() => {
        if (block.data.obj?.image?.url) {
          setPreview(getProtectedUrl(block.data.obj.image.url));
        }
      }, [block.data.obj]);
      useEffect(() => {
        if (block.data.values) {
          formHook.form.setValue(
            "description",
            block.data.values.description || ""
          );
        }
      }, [block.data.values]);
      const staticMode = block.data?.static || false;
      return (
        <form onSubmit={formHook.handleSubmit} className="space-y-4">
          <Form {...formHook.form}>
            <div className="space-y-1">
              <Label htmlFor="image" className="text-sm">
                Image
              </Label>
              <div className="grid gap-2">
                <div
                  className={`relative flex items-center justify-center border-2 border-dashed rounded-lg h-40 ${
                    !preview ? "border-gray-300 bg-gray-50" : "border-gray-200"
                  }`}
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="object-contain w-full h-full rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 cursor-pointer"
                        onClick={removeImage}
                        disabled={staticMode}
                      >
                        <span className="sr-only">Remove</span>×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-3">
                      <PlusCircle className="w-6 h-6 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF</p>
                    </div>
                  )}

                  <FormField
                    control={formHook.form.control}
                    name="image_file"
                    render={({ field }) => (
                      <input
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                        disabled={field.disabled || staticMode}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                          preview ? "pointer-events-none" : ""
                        }`}
                      />
                    )}
                  />
                </div>
              </div>
              <FormField
                control={formHook.form.control}
                name="image_file"
                render={() => (
                  <>
                    <FormMessage />
                  </>
                )}
              />
            </div>

            <div className="space-y-1">
              <FormField
                control={formHook.form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description"
                        autoComplete="off"
                        {...field}
                        disabled={staticMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                className="cursor-pointer"
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
