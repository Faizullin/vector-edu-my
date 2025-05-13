import type { DocumentId } from "@/client";
import {
  ComponentFormBase,
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/components/nice-modal/NiceModal";
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
import { type LessonDocument } from "../data/schema";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
});

export const LessonEditNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    recordId: DocumentId;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const formMode = useMemo(() => {
    return props.recordId ? "edit" : "create";
  }, [props.recordId]);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const formHook = useComponentBaseForm<LessonDocument, typeof formSchema>({
    schema: formSchema,
    apiService: createDefaultApiService<LessonDocument>({
      url: `/lessons/lessons`,
    }),
    queryKey: "lessons", // Used for cache management
    invalidateQueriesOnMutate: true,
    initialMode: formMode,
    recordId: props.recordId,
    defaultValues: {
      title: "",
      description: "",
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
        formMode === "edit" ? "Edit Lesson" : "Create Lesson"
      }
      formName="lessons-form"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-6 text-right">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description"
                        className="col-span-6 mt-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              {/* <FormField
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
                      items={lessonsPublicationStatusOptions}
                      isControlled
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              /> */}
            </div>
          </Form>
        );
      }}
    </ComponentFormBase>
  );
});
