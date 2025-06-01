"use client";

import { simpleRequest } from "@/lib/simpleRequest";
import { cn } from "@/lib/utils";
import type { DocumentBase, DocumentId } from "@/types";
import { handleServerError } from "@/utils/handle-server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import type { z, ZodType, ZodTypeDef } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface ComponentClasses {
  dialogContent?: ReturnType<typeof cn>;
}

/**
 * Form mode types
 */
export type FormMode = "create" | "edit" | "view";

/**
 * Generic API interface for CRUD operations
 */
export interface ApiService<T extends DocumentBase> {
  get: (id: string) => Promise<T>;
  create: (data: Omit<T, "id"> | FormData) => Promise<T>;
  update: (id: string, data: Partial<T> | FormData) => Promise<T>;
}

/**
 * Notification handlers interface
 */
interface NotificationHandlers {
  onSuccess?: (message: string, data?: any) => void;
  onError?: (message: string, error?: any) => void;
  onLoading?: (message: string) => void;
}

// ✅ Base form hook interface
interface BaseFormHook<TFieldValues extends FieldValues = any> {
  form: UseFormReturn<TFieldValues>;
  isSubmitting: boolean;
  error: Error | null;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleReset: () => void;
}

// ✅ Extended form hook interface for base form
interface ExtendedFormHook<TFieldValues extends FieldValues = any>
  extends BaseFormHook<TFieldValues> {
  formMode: FormMode;
  recordId: DocumentId | null;
  record: any | null;
  setFormMode: (mode: FormMode) => void;
  setRecordId: (id: DocumentId | null) => void;
}

// ✅ Simple form hook options
interface UseSimpleFormOptions<
  T extends DocumentBase,
  TSchema extends ZodType<unknown, ZodTypeDef, unknown>
> {
  schema: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  notifications?: NotificationHandlers;
  transformToApi?: (formData: z.infer<TSchema>) => Partial<T>;
  fetchFn: (formData: unknown) => Promise<unknown>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

// ✅ Optimized simple form hook
export function useComponentSimpleForm<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>
>(options: UseSimpleFormOptions<T, TSchema>): BaseFormHook<z.infer<TSchema>> {
  const {
    schema,
    defaultValues,
    transformToApi = (data) => data as unknown as Partial<T>,
    fetchFn,
    notifications,
    onSuccess,
  } = options;

  const [error, setError] = useState<Error | null>(null);

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<TSchema>) => {
      const transformed = transformToApi(data);
      return await fetchFn(transformed);
    },
    onMutate: () => {
      notifications?.onLoading?.("Saving...");
      setError(null);
    },
    onSuccess: (data) => {
      notifications?.onSuccess?.("Saved successfully");
      onSuccess?.(data);
    },
    onError: (err) => {
      const errorObj =
        err instanceof Error ? err : new Error("An error occurred");
      setError(errorObj);
      notifications?.onError?.("Failed to save", err);
      handleServerError(err);
    },
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      mutation.mutate(data);
    },
    () => {
      setError(new Error("Form validation failed"));
    }
  );

  const handleReset = useCallback(() => {
    form.reset(defaultValues);
    setError(null);
  }, [form, defaultValues]);

  return {
    form,
    handleSubmit,
    handleReset,
    isSubmitting: mutation.isPending,
    error,
  };
}

// ✅ Base form options
interface UseBaseFormOptions<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>
> {
  schema?: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  initialMode?: FormMode;
  initialRecord?: T | null;
  recordId: DocumentId | null;
  transformToForm?: (
    data: T,
    action: "load" | "post" | "reset"
  ) => z.infer<TSchema>;
  transformToApi?: (formData: z.infer<TSchema>) => Partial<T> | FormData;
  switchToEditOnCreate?: boolean;
  apiService?: ApiService<T>;
  onCreateSuccess?: (data: T) => void;
  onUpdateSuccess?: (data: T) => void;
  onLoadSuccess?: (data: T) => void;
  notifications?: NotificationHandlers;
  queryKey?: string;
  invalidateQueriesOnMutate?: boolean;
}

// ✅ Optimized base form hook
export function useComponentBaseForm<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>
>(options: UseBaseFormOptions<T, TSchema>): ExtendedFormHook<z.infer<TSchema>> {
  const {
    schema,
    defaultValues,
    initialMode = "create",
    initialRecord = null,
    recordId: initialRecordId,
    transformToForm = (data) => data as unknown as z.infer<TSchema>,
    transformToApi = (formData) => formData as unknown as Partial<T>,
    switchToEditOnCreate = true,
    apiService,
    onCreateSuccess,
    onUpdateSuccess,
    onLoadSuccess,
    notifications,
    queryKey = "records",
    invalidateQueriesOnMutate = true,
  } = options;

  // ✅ Memoized state
  const [formMode, setFormMode] = useState<FormMode>(initialMode);
  const [recordId, setRecordId] = useState<DocumentId | null>(null);
  const [record, setRecord] = useState<T | null>(initialRecord);
  const [_, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();

  // ✅ Memoized form initialization
  const form = useForm<z.infer<TSchema>>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onChange",
  });

  // ✅ Memoized notification helpers
  const notify = useMemo(
    () => ({
      success: (message: string, data?: any) => {
        notifications?.onSuccess?.(message, data);
      },
      error: (message: string, err?: any) => {
        const errorObj = err instanceof Error ? err : new Error(message);
        setError(errorObj);
        notifications?.onError?.(message, err);
      },
      loading: (message: string) => {
        notifications?.onLoading?.(message);
      },
    }),
    [notifications]
  );

  // ✅ Optimized mutations with proper error handling
  const createMutation = useMutation({
    mutationFn: async (formData: z.infer<TSchema>) => {
      if (!apiService) throw new Error("API service not provided");
      const transformedData = transformToApi(formData);
      return await apiService.create(transformedData as Omit<T, "id">);
    },
    onMutate: () => {
      notify.loading("Creating record...");
      setError(null);
    },
    onSuccess: (createdRecord) => {
      setRecord(createdRecord);
      setRecordId(createdRecord.id);
      notify.success("Record created successfully", createdRecord);

      if (switchToEditOnCreate) {
        setFormMode("edit");
        form.reset(transformToForm(createdRecord, "post"));
      }

      if (invalidateQueriesOnMutate) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }

      onCreateSuccess?.(createdRecord);
    },
    onError: (error) => {
      notify.error("Failed to create record", error);
      handleServerError(error, { form });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<TSchema>) => {
      if (!apiService || !recordId) {
        throw new Error("API service or record ID not provided");
      }
      const transformedData = transformToApi(data);
      return await apiService.update(String(recordId), transformedData);
    },
    onMutate: () => {
      notify.loading("Updating record...");
      setError(null);
    },
    onSuccess: (updatedRecord) => {
      setRecord(updatedRecord);
      notify.success("Record updated successfully", updatedRecord);

      if (invalidateQueriesOnMutate) {
        queryClient.invalidateQueries({
          queryKey: [queryKey, updatedRecord.id],
        });
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }

      onUpdateSuccess?.(updatedRecord);
    },
    onError: (error) => {
      notify.error("Failed to update record", error);
      handleServerError(error, { form });
    },
  });

  // ✅ Optimized record loading
  const loadRecord = useCallback(
    async (id: string): Promise<T> => {
      if (!apiService) throw new Error("API service not provided");

      setIsLoading(true);
      notify.loading("Loading record...");

      try {
        const data = await apiService.get(id);
        setRecord(data);
        setRecordId(data.id);

        if (formMode !== "create") {
          form.reset(transformToForm(data, "load"));
        }

        onLoadSuccess?.(data);
        queryClient.setQueryData([queryKey, id], data);
        return data;
      } catch (err) {
        notify.error("Failed to load record", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      formMode,
      form,
      transformToForm,
      onLoadSuccess,
      queryClient,
      queryKey,
      notify,
    ]
  );

  useEffect(() => {
    if (initialRecordId) {
      if (formMode === "create") {
        setFormMode("edit");
      }
      if (recordId !== initialRecordId) {
        setRecordId(initialRecordId);
        loadRecord(String(initialRecordId)).catch((err) =>
          notify.error("Failed to load record", err)
        );
      }
    } else {
      form.reset(defaultValues || {});
      setFormMode("create");
    }
  }, [initialRecordId]);

  // ✅ Memoized handlers
  const handleSubmit = useMemo(
    () =>
      form.handleSubmit(
        (data) => {
          if (formMode === "edit") {
            updateMutation.mutate(data);
          } else {
            createMutation.mutate(data);
          }
        },
        () => notify.error("Form validation failed")
      ),
    [form, formMode, createMutation, updateMutation, notify]
  );

  const handleReset = useCallback(() => {
    if (formMode === "create") {
      form.reset(defaultValues || {});
    } else if (record) {
      form.reset(transformToForm(record, "reset"));
    } else {
      form.reset();
    }
    setError(null);
  }, [formMode, record, defaultValues, form, transformToForm]);

  return {
    form,
    formMode,
    setFormMode,
    recordId,
    setRecordId,
    record,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error,
    handleSubmit,
    handleReset,
  };
}

// ✅ Create default API service factory
export const createDefaultApiService = <T extends DocumentBase>({
  url,
}: {
  url: string;
}): ApiService<T> => ({
  get: async (id: string) =>
    simpleRequest<T>({
      url: `${url}/${id}`,
      method: "GET",
    }) as Promise<T>,
  create: async (data: Omit<T, "id"> | FormData) =>
    simpleRequest<T>({
      url,
      method: "POST",
      body: data,
    }) as Promise<T>,
  update: async (id: string, data: Partial<T> | FormData) =>
    simpleRequest<T>({
      url: `${url}/${id}`,
      method: "PUT",
      body: data,
    }) as Promise<T>,
});

// ✅ Type guards
function isExtendedFormHook<T extends FieldValues>(
  hook: BaseFormHook<T> | ExtendedFormHook<T>
): hook is ExtendedFormHook<T> {
  return "formMode" in hook;
}

// ✅ Component props with better typing
interface ComponentFormBaseProps<
  T extends DocumentBase,
  TFieldValues extends FieldValues = any
> {
  formName: string;
  formHook: BaseFormHook<TFieldValues> | ExtendedFormHook<TFieldValues>;
  modal: { visible: boolean; hide: () => void };
  displayType: "dialog" | "drawer";
  getTitle: (
    hook: BaseFormHook<TFieldValues> | ExtendedFormHook<TFieldValues>
  ) => string;
  isProcessing?: boolean;
  showResetButton?: boolean;
  children:
    | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
    | React.ReactNode;
  getSubmitButtonText?: (
    hook: BaseFormHook<TFieldValues> | ExtendedFormHook<TFieldValues>
  ) => string;
  componentClasses?: ComponentClasses;
}

// ✅ Optimized component with better performance
export const ComponentFormBase = <
  T extends DocumentBase,
  TFieldValues extends FieldValues = any
>({
  formName,
  formHook,
  modal,
  displayType,
  getTitle,
  isProcessing = false,
  children,
  getSubmitButtonText,
  componentClasses,
}: ComponentFormBaseProps<T, TFieldValues>) => {
  // ✅ Memoized submit button text
  const submitButtonText = useMemo(() => {
    if (getSubmitButtonText) {
      return getSubmitButtonText(formHook);
    }

    if (isExtendedFormHook(formHook)) {
      return formHook.formMode === "create" ? "Create" : "Save Changes";
    }

    return "Submit";
  }, [formHook, getSubmitButtonText]);

  // ✅ Memoized title
  const title = useMemo(() => getTitle(formHook), [getTitle, formHook]);

  // ✅ Memoized close handler
  const handleClose = useCallback(() => {
    modal.hide();
    formHook.form.reset();
  }, [modal, formHook.form]);

  // ✅ Memoized form content
  const formContent = useMemo(
    () => (typeof children === "function" ? children(formHook.form) : children),
    [children, formHook.form]
  );

  if (displayType === "dialog") {
    return (
      <Dialog open={modal.visible} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent
          className={cn(
            "!max-w-[1000px]",
            componentClasses?.dialogContent || ""
          )}
        >
          <form id={formName} onSubmit={formHook.handleSubmit}>
            <DialogHeader className="text-left">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Click save when you are done.
              </DialogDescription>
            </DialogHeader>
            <div className="-mr-4 w-full overflow-y-auto pt-4 pr-4">
              {formContent}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                form={formName}
                disabled={isProcessing || formHook.isSubmitting}
              >
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={modal.visible} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="flex flex-col">
        <form onSubmit={formHook.handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>Click save when you are done.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">{formContent}</div>
          <SheetFooter className="gap-2">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button
              type="submit"
              disabled={isProcessing || formHook.isSubmitting}
            >
              {submitButtonText}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
