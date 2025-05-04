import { NiceModalHandler } from '@/components/NiceModal/NiceModal';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { Dialog, Portal, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DefaultValues, FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { z, ZodType, ZodTypeDef } from 'zod';
import { ComponentBase, ComponentId } from '../../types';

export type FormMode = 'create' | 'edit' | 'view';


export interface ApiService<T extends ComponentBase> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  update: (id: ComponentId, data: Partial<T>) => Promise<T>;
  get: (id: ComponentId) => Promise<T>;
}

export interface UseComponentFormOptions<
  T extends ComponentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>
> {
  schema: TSchema;
  apiService: ApiService<T>;
  mode?: FormMode;
  recordId?: ComponentId;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  onSuccess?: (data: T, mode: FormMode) => void;
  onLoadSuccess?: (data: T) => void;
  queryKey: string | string[];
  transform?: (data: T) => z.infer<TSchema>;
  reverseTransform?: (formData: z.infer<TSchema>) => Partial<T>;
  switchToEditOnCreate?: boolean;
}

export function useComponentForm<
  T extends ComponentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>
>(options: UseComponentFormOptions<T, TSchema>) {
  const {
    schema,
    apiService,
    mode: initialMode = 'create',
    recordId: initialRecordId,
    defaultValues,
    onSuccess,
    queryKey,
    transform = (data) => data as unknown as z.infer<TSchema>,
    reverseTransform = (formData) => formData as unknown as Partial<T>,
    onLoadSuccess,
    switchToEditOnCreate = true,
  } = options;

  const [formMode, setFormMode] = useState<FormMode>(initialMode);
  const [recordId, setRecordId] = useState<ComponentId | undefined>(
    initialRecordId,
  );

  const queryClient = useQueryClient();

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const baseQueryKey = useMemo(
    () => (Array.isArray(queryKey) ? queryKey : [queryKey]),
    [queryKey]
  );

  const recordQueryKey = useMemo(
    () =>
      recordId
        ? [...baseQueryKey, recordId]
        : null,
    [baseQueryKey, recordId]
  );

  const shouldFetch = formMode === 'edit' && !!recordId;

  const {
    data: initialData,
    isLoading: isLoadingData,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: recordQueryKey || [],
    queryFn: () =>
      recordId ? apiService.get(recordId) : Promise.reject('No recordId'),
    enabled: shouldFetch && !!recordQueryKey,
  });

  useEffect(() => {
    console.log("baseQueryKey", baseQueryKey);
  }, [baseQueryKey]);
  useEffect(() => {
    console.log("recordQueryKey", recordQueryKey);
  }, [recordQueryKey]);

  useEffect(() => {
    if(initialMode === 'create' || !initialRecordId) {
      form.reset(defaultValues || {});
    }
    setFormMode(initialMode);
    setRecordId(initialRecordId);
  }, [initialMode, initialRecordId]);






  useEffect(() => {
    if (loadError) {
      toaster.create({
        title: 'Error fetching data',
        description:
          loadError instanceof Error
            ? loadError.message
            : 'Unknown error occurred',
        type: 'error',
      });
    }
  }, [loadError]);

  useEffect(() => {
    if (initialData && shouldFetch) {
      form.reset(transform(initialData));
      onLoadSuccess?.(initialData);
    }
  }, [initialData, form, shouldFetch]);

  const createMutation = useMutation({
    mutationFn: (data: z.infer<TSchema>) => {
      const transformed = reverseTransform(data);
      return apiService.create(
        transformed as Omit<T, 'id' | 'createdAt' | 'updatedAt'>
      );
    },
    onSuccess: (data) => {
      toaster.create({ title: 'Created successfully', type: 'success' });

      queryClient.invalidateQueries({ queryKey: baseQueryKey });

      if (switchToEditOnCreate) {
        setFormMode('edit');
        setRecordId(data.id);
        form.reset(transform(data));
        setTimeout(() => refetch(), 0);
      }

      onSuccess?.(data, 'create');
    },
    onError: (error) => {
      toaster.create({
        title: 'Error creating',
        description: error instanceof Error ? error.message : '',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<TSchema>) => {
      if (!recordId && !initialData)
        throw new Error('Record ID is required for update');
      const id = recordId || (initialData?.id as ComponentId);
      const transformed = reverseTransform(data);
      return apiService.update(id, transformed);
    },
    onSuccess: (data) => {
      toaster.create({ title: 'Updated successfully', type: 'success' });

      if (recordQueryKey) {
        queryClient.invalidateQueries({ queryKey: recordQueryKey });
      } else {
        queryClient.invalidateQueries({ queryKey: baseQueryKey });
      }

      onSuccess?.(data, 'edit');
    },
    onError: (error) => {
      toaster.create({
        title: 'Error updating',
        description: error instanceof Error ? error.message : '',
        type: 'error',
      });
    },
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      if (formMode === 'edit') {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    },
    () => {
      toaster.create({
        title: 'Form validation failed',
        description: 'Please check the form',
        type: 'error',
      });
    }
  );

  const resetForm = () => {
    if (initialData && formMode === 'edit') {
      form.reset(transform(initialData));
    } else {
      form.reset(defaultValues || {});
    }
  };

  return {
    form,
    formMode,
    setFormMode,
    recordId,
    setRecordId,
    isLoading: isLoadingData,
    isProcessing:
      isLoadingData || createMutation.isPending || updateMutation.isPending,
    handleSubmit,
    resetForm,
    createMutation,
    updateMutation,
    initialData: initialData || null,
  };
}

// Props for ComponentFormBase
export interface ComponentFormBaseProps<
  T extends ComponentBase,
  TSchema extends ZodType<any, ZodTypeDef, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>
> {
  formHook: ReturnType<typeof useComponentForm<T, TSchema>>;
  title: string;
  children: ReactNode | ((form: UseFormReturn<TFieldValues>) => ReactNode);
  showResetButton?: boolean;
  showCancelButton?: boolean;
  submitButtonText?: string;
  isFullWidth?: boolean;
  modal: NiceModalHandler;
}

/**
 * Base Form Component
 */
export function ComponentFormBase<
  T extends ComponentBase,
  TSchema extends ZodType<any, ZodTypeDef, any> = ZodType<any, ZodTypeDef, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>
>({
  formHook,
  title,
  children,
  submitButtonText,
  showResetButton = false,
  modal,
}: ComponentFormBaseProps<T, TSchema, TFieldValues>) {
  const { form, formMode, handleSubmit, resetForm, isProcessing } = formHook;

  // Determine dynamic button text
  const getSubmitButtonText = () =>
    submitButtonText || (formMode === 'create' ? 'Create' : 'Update');

  // Conditionally render view-only or editable form
  const isViewMode = formMode === 'view';

  const handleCancel = useCallback(() => {
    form.reset();
    modal.hide();
  }, [form, modal]);

  return (
    <Dialog.Root open={modal.visible}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>
                  {isViewMode ? `View ${title}` : formMode === 'create' ? `Create ${title}` : `Edit ${title}`}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="4">
                <Stack spaceY={2}>
                  {typeof children === 'function' ? children(form as UseFormReturn<TFieldValues>) : children}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                    size="xs"
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>

                {showResetButton && !isViewMode && (
                  <Button
                    variant="ghost"
                    onClick={resetForm}
                    disabled={isProcessing}
                    size="xs"
                  >
                    Reset
                  </Button>
                )}

                {!isViewMode && (
                  <Button
                    type="submit"
                    colorScheme="blue"
                    loading={isProcessing}
                    loadingText={formMode === 'create' ? 'Creating...' : 'Updating...'}
                    size="xs"
                  >
                    {getSubmitButtonText()}
                  </Button>
                )}
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}