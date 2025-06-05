import { AuthUser } from "@/types";
import { Log } from "@/utils/log";
import { simpleRequest } from "./simpleRequest";

type SetStorageDataParams = {
  token: string;
  user: AuthUser;
};

export class JwtAuthService {
  static async setStorageData(
    data: Partial<SetStorageDataParams>,
    options?: {
      partial?: boolean;
    }
  ) {
    const usePartial = options?.partial ?? false;
    if (!usePartial) {
      if (!data.token || !data.user) {
        throw new Error(
          "Token and user data are required to set auth data in localStorage"
        );
      }
    }
    const existingData = await this.getStorageData();
    const newData = {
      ...existingData,
      ...data,
    };
    try {
      localStorage.setItem("auth", JSON.stringify(newData));
    } catch (error) {
      Log.error("Error setting auth data in localStorage", error);
    }
  }
  static async getStorageData(): Promise<SetStorageDataParams | null> {
    const data = localStorage.getItem("auth");
    if (!data) {
      return null;
    }
    let parsedData: SetStorageDataParams;
    try {
      const rawData = JSON.parse(data);
      parsedData = {
        token: rawData.token,
        user: rawData.user,
      };
    } catch (error) {
      Log.error("Error parsing auth data from localStorage", error);
      return null;
    }
    return parsedData;
  }
  static async clearStorageData() {
    try {
      localStorage.removeItem("auth");
    } catch (error) {
      Log.error("Error clearing auth data from localStorage", error);
    }
  }

  static async loginWithFirebaseToken(token: string) {
    try {
      const response = await simpleRequest<{
        message: AuthUser & {
          token: string;
        };
      }>({
        url: "/auth",
        method: "POST",
        body: {
          token: token,
        },
        urlPrefix: "/api_users",
        auth: {
          disable: true, // Disable auth for this request
        },
      });
      const res: SetStorageDataParams = {
        token: response!.message.token,
        user: response!.message,
      };
      delete (res as any).user["token"];
      await this.setStorageData(res);
      return res;
    } catch (error) {
      Log.error("Error logging in with Firebase UID", error);
      throw error;
    }
  }

  static async getUser() {
    try {
      const response = await simpleRequest<{
        message: AuthUser;
      }>({
        url: "/get_user",
        method: "GET",
        urlPrefix: "/api_users",
      });
      return response!.message;
    } catch (error) {
      Log.error("Error fetching user data", error);
      throw error;
    }
  }
}
