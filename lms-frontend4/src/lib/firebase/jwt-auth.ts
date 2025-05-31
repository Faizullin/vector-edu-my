import { Log } from "@/utils/log";
import { User } from "firebase/auth";
import { simpleRequest } from "../simpleRequest";

export class JwtAuthService {
  static async setJWTToken(token: string | null) {
    localStorage.setItem("jwt-token", token || "");
  }

  static async getJWTToken() {
    return localStorage.getItem("jwt-token");
  }

  static async syncUserWithBackend(user: User) {
    const token = await this.getJWTToken();
    if (!token) {
      Log.error("No JWT token found, cannot sync user with backend");
      throw new Error("No JWT token found");
    }
    try {
      const response = await simpleRequest({
        url: "/auth/me/",
        method: "GET",
        auth: {
          token: token,
        },
      });
      return response;
    } catch (error) {
      Log.error("Error syncing user with backend", error);
      throw error;
    }
  }

  static async loginWithFirebaseToken(token: string) {
    try {
      const response = await simpleRequest<{
        message: {
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
      await this.setJWTToken(response!.message.token);
      return response;
    } catch (error) {
      Log.error("Error logging in with Firebase UID", error);
      throw error;
    }
  }
}
