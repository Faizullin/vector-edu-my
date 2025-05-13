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
import { useCustomToast } from "@/hooks/use-custom-toast";
import { z } from "zod";
import { userPaymentTypes, type UserDocument } from "../data/schema"; // your UserDocument type

const formSchema = z.object({
  user_type: z.enum(userPaymentTypes.map((item) => item.value) as any, {
    required_error: "User type is required.",
  }),
});

export const UserToggleStatusNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{ userIds: DocumentId[] }>
>(({ userIds }) => {
  const modal = NiceModal.useModal();
  const formMode = "create";
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const formHook = useComponentBaseForm<UserDocument, typeof formSchema>({
    schema: formSchema,
    apiService: createDefaultApiService<UserDocument>({
      url: `/accounts/users/toggle-user-type`,
    }),
    queryKey: "users/toggle-user-type",
    invalidateQueriesOnMutate: true,
    switchToEditOnCreate: false,
    resetOnModeChange: false,
    initialMode: formMode,
    recordId: null,
    defaultValues: {
      user_type: null,
    },
    notifications: {
      onSuccess: (title) => showSuccessToast({ title }),
      onError: (title, errorMsg) =>
        showErrorToast({ title, description: errorMsg }),
    },
    transformToApi(formData) {
      return {
        user_ids: userIds,
        user_type: formData.user_type,
      };
    },
  });

  return (
    <ComponentFormBase
      formHook={formHook}
      modal={modal}
      displayType="dialog"
      getTitle={(_) => "Toggle users"}
      formName="user-form"
      getSubmitButtonText={(_) => "Save"}
    >
      {({ control }) => (
        <Form {...formHook.form}>
          <div className="space-y-4 p-0.5">
            <FormField
              control={control}
              name="user_type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                  <FormLabel className="col-span-2 text-right">
                    User Type
                  </FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={userPaymentTypes}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select user type"
                      className="col-span-4"
                      isControlled
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
              )}
            />
          </div>
        </Form>
      )}
    </ComponentFormBase>
  );
});
