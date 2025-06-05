import { AuthUser, AuthUserNotificationSettings } from "@/types";
import { simpleRequest } from "./simpleRequest";

export class SettingsService {
  static async updateUserSettingsProfile(formData: {
    name: string;
    description: string;
  }) {
    try {
      const response = await simpleRequest<{
        message: AuthUser;
      }>({
        url: "/edit_user_data",
        method: "POST",
        urlPrefix: "/api_users",
        body: {
          ...formData,
          notification_settings: {},
        },
      });
      return response!.message;
    } catch (error) {
      throw error;
    }
  }
  static async updateUserSettingsAvatar(formData: FormData) {
    try {
      const response = await simpleRequest<{
        message: AuthUser;
      }>({
        url: "/edit_photo",
        method: "POST",
        urlPrefix: "/api_users",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response!.message;
    } catch (error) {
      throw error;
    }
  }
  static async updateUserSettingsNotificationsSettings(
    formData: Omit<
      AuthUserNotificationSettings,
      "last_lesson_reminder" | "last_streak_notification"
    >
  ) {
    try {
      const response = await simpleRequest<{
        message: AuthUser;
      }>({
        url: "/edit_user_data",
        method: "POST",
        urlPrefix: "/api_users",
        body: {
          notification_settings: formData,
        },
      });
      return response!.message;
    } catch (error) {
      throw error;
    }
  }
}
