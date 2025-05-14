import type { DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import {
  ComponentFormBase,
  createDefaultApiService,
  useComponentBaseForm,
} from "@/components/form/component-base";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "@/components/nice-modal/NiceModal";
import { SelectDropdown } from "@/components/select-dropdown";
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
import { Textarea } from "@/components/ui/textarea";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { type LessonBatchDocument, type LessonDocument } from "../data/schema";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  lesson_batch: z.string().min(1, { message: "Lesson batch is required." }),
  is_available_on_free: z.boolean().optional(),
  order: z.string().optional(),
});

export const LessonEditNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    recordId?: DocumentId;
    defaultValues?: Partial<LessonDocument>;
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
    recordId: props.recordId || null,
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
    transformToForm(data, meta) {
      const newData: any = {
        ...data,
      };
      if (meta.action === "load") {
        if (data.lesson_batch) {
          newData.lesson_batch = `${data.lesson_batch.id}`;
        }
      }
      return newData;
    },
  });
  const lessonBatchesQuery = useQuery<LessonBatchDocument[]>({
    queryKey: ["lesson-batches"],
    queryFn: () =>
      simpleRequest({
        url: "/lessons/batches/",
        method: "GET",
        query: {
          disablePagination: true,
        },
      }),
  });
  const lessonBatchesOptions = useMemo(() => {
    return lessonBatchesQuery.data?.map((item) => ({
      label: item.title,
      value: `${item.id}`,
    }));
  }, [lessonBatchesQuery.data]);
  useEffect(() => {
    if (props.defaultValues?.lesson_batch) {
      formHook.form.setValue(
        "lesson_batch",
        `${props.defaultValues.lesson_batch?.id}`
      );
    }
  }, [props.defaultValues]);

  return (
    <ComponentFormBase
      formHook={formHook}
      modal={modal}
      displayType="dialog"
      getTitle={(hook: any) =>
        hook.formMode === "edit" ? "Edit Lesson" : "Create Lesson"
      }
      formName="lessons-form"
    >
      {({ control }) => {
        return (
          <Form {...formHook.form}>
            <div className="space-y-4 p-0.5 mb-6">
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
              <FormField
                control={control}
                name="lesson_batch"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">
                      Lesson Batch
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select"
                      className="col-span-4"
                      items={lessonBatchesOptions}
                      isControlled
                    />
                    <FormMessage className="col-span-6 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="is_available_on_free"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">
                      Is Available on Free
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        className="col-span-4"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="order"
                disabled={formHook.formMode !== "edit"}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">
                      Order
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Order"
                        type="number"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
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
