import {Log} from "@/utils/log";
import {simpleRequest} from "../simpleRequest";

export class JwtAuthService {
    static async setJWTToken(token: string | null) {
        localStorage.setItem("jwt-token", token || "");
    }

    static async getJWTToken() {
        return localStorage.getItem("jwt-token");
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
