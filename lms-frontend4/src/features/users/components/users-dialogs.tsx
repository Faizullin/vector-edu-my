import {
  ComponentFormBase,
  useComponentSimpleForm,
} from "@/components/form/component-base";
import { SelectDropdown } from "@/components/form/select-dropdown";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import { simpleRequest } from "@/lib/simpleRequest";
import { showToast } from "@/utils/handle-server-error";
import { z } from "zod";
import { type UserDocument, userPaymentTypes } from "../data/schema"; // your UserDocument type

const tmpOptions = [
  ...userPaymentTypes.map((item) => item.value),
] as unknown as readonly [string, ...string[]];
const formSchema = z.object({
  user_type: z
    .enum(tmpOptions, {
      required_error: "User type is required.",
    })
    .nullable(),
});

export const UserToggleStatusNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{ users: UserDocument[] }>
>(({ users }) => {
  const modal = NiceModal.useModal();
  const formHook = useComponentSimpleForm<UserDocument, typeof formSchema>({
    schema: formSchema,
    defaultValues: {
      user_type: null,
    },
    onSuccess() {
      modal.resolve({
        result: true,
      });
    },
    notifications: {
      onSuccess: (message) =>
        showToast("success", {
          message,
        }),
      onError: (message, errorMsg) =>
        showToast("error", {
          message,
          data: {
            description: errorMsg,
          },
        }),
    },
    transformToApi(formData) {
      return {
        user_ids: users.map((user) => user.id),
        user_type: formData.user_type as any,
      };
    },
    fetchFn: (): Promise<unknown> =>
      simpleRequest({
        url: `/accounts/users/toggle-user-type`,
        method: "POST",
        body: {
          user_ids: users.map((user) => user.id),
          user_type: formHook.form.getValues("user_type"),
        },
      }),
  });

  return (
    <ComponentFormBase
      formHook={formHook}
      modal={modal}
      displayType="dialog"
      getTitle={() => "Toggle users"}
      formName="user-form"
      getSubmitButtonText={() => "Save"}
      componentClasses={{
        dialogContent: "!max-w-lg",
      }}
    >
      {({ control }) => (
        <Form {...formHook.form}>
          <div className="space-y-4 p-0.5 mb-6">
            <FormField
              control={control}
              name="user_type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                  <FormLabel className="col-span-2 text-right">
                    User Type
                  </FormLabel>
                  <FormControl className="col-span-4 w-auto">
                    <SelectDropdown
                      items={userPaymentTypes}
                      defaultValue={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder="Select user type"
                      isControlled
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              {users.length} user{users.length > 1 ? "s" : ""} will be updated.
            </div>
          </div>
        </Form>
      )}
    </ComponentFormBase>
  );
});
