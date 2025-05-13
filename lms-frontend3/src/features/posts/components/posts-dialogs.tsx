import type { DocumentId } from "@/client";
import {
  ComponentFormBase,
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/components/nice-modal/NiceModal";
import { SelectDropdown } from "@/components/select-dropdown";
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
import { useMemo } from "react";
import { z } from "zod";
import {
  postsPublicationStatusOptions,
  type PostDocument,
} from "../data/schema";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  publication_status: z
    .string()
    .min(1, { message: "Publication status is required." }),
});

export const PostEditNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    recordId: DocumentId;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const formMode = useMemo(() => {
    return props.recordId ? "edit" : "create";
  }, [props.recordId]);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const formHook = useComponentBaseForm<PostDocument, typeof formSchema>({
    schema: formSchema,
    apiService: createDefaultApiService<PostDocument>({
      url: `/resources/posts`,
    }),
    queryKey: "posts", // Used for cache management
    invalidateQueriesOnMutate: true,
    initialMode: formMode,
    recordId: props.recordId,
    defaultValues: {
      title: "",
      publication_status: "0",
    },
    transformToForm(data) {
      return {
        title: data.title,
        publication_status: data.publication_status.toString(),
      };
    },
    notifications: {
      onSuccess: (title) => {
        showSuccessToast({
          title,
          duration: 2000,
        });
      },
      onError: (title) => {
        showErrorToast({
          title,
          duration: 2000,
        });
      },
    },
  });
  return (
    <ComponentFormBase
      formHook={formHook}
      modal={modal}
      displayType="dialog"
      getTitle={(formMode) =>
        formMode === "edit" ? "Edit Post" : "Create Post"
      }
      formName="posts-form"
    >
      {({ control }) => {
        return (
          <Form {...formHook.form}>
            <div className="space-y-4 p-0.5">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Title"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="publication_status"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">
                      Publication Status
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select"
                      className="col-span-4"
                      items={postsPublicationStatusOptions}
                      isControlled
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        );
      }}
    </ComponentFormBase>
  );
});
