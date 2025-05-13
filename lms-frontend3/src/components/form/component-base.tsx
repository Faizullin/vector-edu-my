import type { ApiError, DocumentBase, DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
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
import { Log } from "@/utils/log";

/**
 * Form mode types
 */
export type FormMode = "create" | "edit" | "view";

/**
 * Generic API interface for CRUD operations
 */
export interface ApiService<T extends DocumentBase> {
  get: (id: string) => Promise<T>;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
}

/**
 * Notification handlers interface
 */
interface NotificationHandlers {
  onSuccess?: (message: string, data?: any) => void;
  onError?: (message: string, error?: any) => void;
  onLoading?: (message: string) => void;
}

/**
 * Form configuration options
 */
interface FormOptions<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>,
> {
  // Core configuration
  schema?: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  initialMode?: FormMode;

  // Initial record options
  initialRecord?: T | null;
  recordId: DocumentId | null;

  // Data transformation
  transformToForm?: (data: T) => z.infer<TSchema>;
  transformToApi?: (formData: z.infer<TSchema>) => Partial<T>;

  // Mode switching behavior
  switchToEditOnCreate?: boolean;
  resetOnModeChange?: boolean;

  // API configuration
  apiService?: ApiService<T>;
  manualApiHandling?: boolean;

  // Callback handlers
  onCreateSuccess?: (data: T) => void;
  onUpdateSuccess?: (data: T) => void;
  onLoadSuccess?: (data: T) => void;

  // Notification handlers
  notifications?: NotificationHandlers;

  // Query options
  queryKey?: string;
  invalidateQueriesOnMutate?: boolean;
}

/**
//  * Return type for the useForm hook
//  */
// export interface UseComponentBaseFormReturn<
//   T extends DocumentBase,
//   TSchema extends ZodType<any, ZodTypeDef, any>,
// > {
//   // Form state and controls
//   form: UseFormReturn<z.infer<TSchema>>;
//   formMode: FormMode;
//   setFormMode: (mode: FormMode) => void;

//   // Record handling
//   recordId: string | undefined;
//   setRecordId: (id: string | undefined) => void;
//   record: T | null;

//   // Operations
//   handleSubmit: () => Promise<void>;
//   handleReset: () => void;
//   handleLoad: (id?: string) => Promise<void>;

//   // Status
//   isLoading: boolean;
//   isSubmitting: boolean;
//   isViewMode: boolean;

//   // Errors
//   error: Error | null;
//   setError: (error: Error | null) => void;

//   // Manual API access
//   createRecord: (data: z.infer<TSchema>) => Promise<T>;
//   updateRecord: (data: z.infer<TSchema>) => Promise<T>;
//   loadRecord: (id: string) => Promise<T>;

//   // Mutation states
//   createMutation: ReturnType<typeof useMutation<T>>;
//   updateMutation: ReturnType<typeof useMutation<T>>;
// }

export const createDefaultApiService = <T extends DocumentBase>({
  url,
}: {
  url: string;
}): ApiService<T> => ({
  get: async (id: string) => {
    return simpleRequest({
      url: `${url}/${id}/`,
      method: "GET",
    }) as Promise<T>;
  },
  create: async (data: Omit<T, "id">) => {
    return simpleRequest({
      url: `${url}/`,
      method: "POST",
      body: data,
    }) as Promise<T>;
  },
  update: async (id: string, data: Partial<T>) => {
    return simpleRequest({
      url: `${url}/${id}/`,
      method: "PATCH",
      body: data,
    }) as Promise<T>;
  },
});

type ValidationError<TAttr> = {
  type: "validation_error";
  errors: Array<{
    attr: TAttr;
    message: string;
    detail: string;
  }>;
};

/**
 * A comprehensive form management hook that integrates with API services,
 * handles different form modes (create, edit, view), and uses TanStack Query mutations
 */
export function useComponentBaseForm<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>,
>(options: FormOptions<T, TSchema>) {
  const {
    schema,
    defaultValues,
    initialMode = "create",
    initialRecord = null,
    recordId: initialRecordId,
    transformToForm = (data) => data as unknown as z.infer<TSchema>,
    transformToApi = (formData) => formData as unknown as Partial<T>,
    switchToEditOnCreate = true,
    resetOnModeChange = true,
    apiService,
    onCreateSuccess,
    onUpdateSuccess,
    onLoadSuccess,
    notifications,
    queryKey = "records",
    invalidateQueriesOnMutate = true,
  } = options;

  // State management
  const [formMode, setFormMode] = useState<FormMode>(initialMode);
  const [recordId, setRecordId] = useState<DocumentId | null>(initialRecordId);
  const [record, setRecord] = useState<T | null>(initialRecord);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Get query client for cache management
  const queryClient = useQueryClient();

  // Initialize react-hook-form
  const form = useForm<z.infer<TSchema>>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onChange",
  });

  // Notify helpers
  const notify = {
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
  };

  const handleServerError = (error: ApiError) => {
    Log.error("Server error:", error.name, error.message);
    if (error.message === "Bad Request") {
      if ((error.body as any)?.["type"] === "validation_error") {
        const errorBody = error.body as ValidationError<string>;
        errorBody.errors.forEach((value) => {
          const fieldName = value.attr;
          if (value.detail) {
            form.setError(fieldName as any, {
              type: "manual",
              message: value.detail,
            });
          }
        });
        notify.error("Failed to create record", error);
      } else {
        if ((error.body as any).error) {
          notify.error("Failed to save", (error.body as any).error);
        }
      }
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: z.infer<TSchema>) => {
      if (!apiService) {
        throw new Error("API service not provided");
      }

      const transformedData = transformToApi(formData);
      return await apiService.create(transformedData as Omit<T, "id">);
    },
    onMutate: () => {
      notify.loading("Creating record...");
    },
    onSuccess: (createdRecord) => {
      setRecord(createdRecord);
      setRecordId(createdRecord.id);

      notify.success("Record created successfully", createdRecord);

      if (switchToEditOnCreate) {
        setFormMode("edit");
        form.reset(transformToForm(createdRecord));
      }

      if (invalidateQueriesOnMutate) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }

      onCreateSuccess?.(createdRecord);
    },
    onError: (err: ApiError) => {
      handleServerError(err);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<TSchema>) => {
      if (!apiService) {
        throw new Error("API service not provided");
      }
      const transformedData = transformToApi(data);
      return await apiService.update(recordId!, transformedData);
    },
    onMutate: () => {
      notify.loading("Updating record...");
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
    onError: (err: ApiError) => {
      handleServerError(err);
    },
  });

  // Handle form mode changes
  useEffect(() => {
    if (resetOnModeChange) {
      if (formMode === "create") {
        form.reset(defaultValues || {});
      } else if (formMode === "edit" && record) {
        form.reset(transformToForm(record));
      }
    }

    // Disable form controls in view mode
    if (formMode === "view") {
      Object.keys(form.getValues()).forEach((key) => {
        form.register(key as any, { disabled: true });
      });
    }
  }, [formMode, record]);

  // Load record when recordId changes
  useEffect(() => {
    if (
      recordId &&
      apiService &&
      (formMode === "edit" || formMode === "view")
    ) {
      loadRecord(recordId).catch((err) =>
        notify.error("Failed to load record", err),
      );
    }
  }, [recordId, formMode]);

  useEffect(() => {
    if (initialRecordId) {
      if (formMode === "create") {
        setFormMode("edit");
      }
      if (recordId !== initialRecordId) {
        setRecordId(initialRecordId);
      }
    } else {
      form.reset(defaultValues || {});
      setFormMode("create");
    }
  }, [initialRecordId]);

  // API operations
  const loadRecord = async (id: string): Promise<T> => {
    if (!apiService) {
      throw new Error("API service not provided");
    }

    setIsLoading(true);
    notify.loading("Loading record...");

    try {
      const data = await apiService.get(id);
      setRecord(data);
      setRecordId(data.id);

      if (formMode !== "create") {
        form.reset(transformToForm(data));
      }

      onLoadSuccess?.(data);

      // Update cache
      queryClient.setQueryData([queryKey, id], data);

      return data;
    } catch (err) {
      notify.error("Failed to load record", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      if (formMode === "edit") {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    },
    () => {
      notify.error("Form validation failed");
    },
  );

  // Reset form handler
  const handleReset = useCallback(() => {
    if (formMode === "create") {
      form.reset(defaultValues || {});
    } else if (record) {
      form.reset(transformToForm(record));
    } else {
      form.reset();
    }

    setError(null);
  }, [formMode, record, defaultValues]);

  // Load record handler (can be called manually)
  const handleLoad = useCallback(
    async (id?: string): Promise<void> => {
      const targetId = id || recordId;
      if (!targetId) {
        notify.error("No record ID provided");
        return Promise.reject(new Error("No record ID provided"));
      }

      try {
        await loadRecord(targetId);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    [recordId],
  );

  return {
    form,
    formMode,
    setFormMode,
    recordId,
    setRecordId,
    record,
    isLoading,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isViewMode: formMode === "view",
    error,
    setError,
    handleSubmit,
    handleReset,
    handleLoad,
    loadRecord,
    createMutation,
    updateMutation,
  };
}

interface ComponentFormBaseProps<
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any> = ZodType<any, ZodTypeDef, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>,
> {
  formName: string;
  formHook: ReturnType<typeof useComponentBaseForm<T, TSchema>>;
  modal: { visible: boolean; hide: () => void };
  displayType: "dialog" | "drawer";
  getTitle: (formMode: FormMode) => string;
  isProcessing?: boolean;
  showResetButton?: boolean;
  children:
    | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
    | React.ReactNode;
  getSubmitButtonText?: (formMode: FormMode) => string;
}

export const ComponentFormBase = <
  T extends DocumentBase,
  TSchema extends ZodType<any, ZodTypeDef, any> = ZodType<any, ZodTypeDef, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>,
>({
  formName,
  formHook,
  modal,
  displayType,
  getTitle,
  isProcessing = false,
  children,
  getSubmitButtonText,
}: ComponentFormBaseProps<T, TSchema, TFieldValues>) => {
  const submitButtonText = useMemo(() => {
    return getSubmitButtonText
      ? getSubmitButtonText(formHook.formMode)
      : formHook.formMode === "create"
        ? "Create"
        : "Save Changes";
  }, [formHook.formMode, getSubmitButtonText]);

  if (displayType === "dialog") {
    return (
      <Dialog
        open={modal.visible}
        onOpenChange={(v) => {
          if (!v) {
            modal.hide();
          }
          formHook.form.reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form id={formName} onSubmit={formHook.handleSubmit}>
            <DialogHeader className="text-left">
              <DialogTitle>{getTitle(formHook.formMode)}</DialogTitle>
              <DialogDescription>
                {"Click save when you are done."}
              </DialogDescription>
            </DialogHeader>
            <div className="-mr-4 w-full overflow-y-auto pt-4 pr-4">
              {typeof children === "function"
                ? children(formHook.form)
                : children}
            </div>
            <DialogFooter>
              <Button type="submit" form={formName} disabled={isProcessing}>
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  } else if (displayType === "drawer") {
    return (
      <Sheet
        open={modal.visible}
        onOpenChange={(v) => {
          if (!v) {
            modal.hide();
          }
          formHook.form.reset();
        }}
      >
        <SheetContent className="flex flex-col">
          <form onSubmit={formHook.handleSubmit}>
            <SheetHeader className="text-left">
              <SheetTitle>{getTitle(formHook.formMode)}</SheetTitle>
              <SheetDescription>
                {"Click save when you are done."}
              </SheetDescription>
            </SheetHeader>
            {typeof children === "function"
              ? children(formHook.form)
              : children}
            <SheetFooter className="gap-2">
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
              <Button form={formName} type="submit" disabled={isProcessing}>
                {submitButtonText}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }
};
