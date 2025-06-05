"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { JwtAuthService } from "@/lib/jwt-auth";
import { SettingsService } from "@/lib/settings-service";
import { showToast } from "@/utils/handle-server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const notificationsFormSchema = z.object({
  friend_request_notification: z.boolean(),
  global_event_notification: z.boolean(),
  periodic_lesson_reminder: z.boolean(),
  streak_notification: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  friend_request_notification: false,
  global_event_notification: false,
  periodic_lesson_reminder: false,
  streak_notification: false,
};

export function NotificationsForm() {
  const queryClient = useQueryClient();

  const userProfileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: JwtAuthService.getUser,
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: NotificationsFormValues) => {
      return SettingsService.updateUserSettingsNotificationsSettings(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], data);
      showToast("success", {
        message: "Notification settings updated successfully!",
      });
    },
    onError: (error) => {
      showToast("error", {
        message: error.message || "Failed to update notification settings.",
      });
    },
  });

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((data) => {
    updateNotificationsMutation.mutate(data);
  });

  useEffect(() => {
    if (userProfileQuery.data) {
      form.setValue(
        "friend_request_notification",
        userProfileQuery.data.notification_settings.friend_request_notification
      );
      form.setValue(
        "global_event_notification",
        userProfileQuery.data.notification_settings.global_event_notification
      );
      form.setValue(
        "periodic_lesson_reminder",
        userProfileQuery.data.notification_settings.periodic_lesson_reminder
      );
      form.setValue(
        "streak_notification",
        userProfileQuery.data.notification_settings.streak_notification
      );
    }
  }, [form, userProfileQuery.data]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="relative">
          <h3 className="mb-4 text-lg font-medium">Notifications Settings</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="friend_request_notification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Friend requests and social notifications
                    </FormLabel>
                    <FormDescription>
                      Notify me of new friend requests.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="global_event_notification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Global Event Notification
                    </FormLabel>
                    <FormDescription>
                      Notify me of important global events and announcements.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="periodic_lesson_reminder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Lesson Reminders
                    </FormLabel>
                    <FormDescription>
                      Enable periodic lesson reminder notifications.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streak_notification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Streak Notifications
                    </FormLabel>
                    <FormDescription>
                      Notify me about my learning streaks.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={updateNotificationsMutation.isPending}
        >
          {updateNotificationsMutation.isPending
            ? "Updating..."
            : "Update Notifications Settings"}
        </Button>
      </form>
    </Form>
  );
}
