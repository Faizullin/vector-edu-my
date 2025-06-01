// libs/firebase/auth.ts

import {
    GoogleAuthProvider,
    onAuthStateChanged as _onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    type User,
} from "firebase/auth";

import {createSession, removeSession} from "@/actions/auth-actions";
import {Log} from "@/utils/log";
import {firebaseAuth} from "./config";
import {JwtAuthService} from "./jwt-auth";

// export interface FirebaseAuthError {
//   code: "auth/operation-not-allowed";
// }

export class FirebaseAuthError extends Error {
    code: string | undefined;

    constructor(message: string, code?: string) {
        super(message);
        this.name = "FirebaseAuthError";
        this.code = code;
    }
}

export class FirebaseAuthService {
    /**
     * Listen to authentication state changes.
     * @param callback - Callback function to handle the auth user.
     */
    static onAuthStateChanged(callback: (authUser: User | null) => void) {
        return _onAuthStateChanged(firebaseAuth, async (user) => {
            callback(user);
        });
    }

    /**
     * Sign in using Google authentication.
     * @returns The result of the Google sign-in.
     */
    static async signInWithGoogle() {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(firebaseAuth, provider);
            if (!result || !result.user) {
                throw new Error("Google sign-in failed");
            }
            const userToken = await result.user.getIdToken();
            const newJwtToken = (
                await JwtAuthService.loginWithFirebaseToken(userToken)
            )?.message.token;
            if (!newJwtToken) {
                throw new Error("Failed to obtain JWT token from Firebase token");
            }
            await createSession({
                uid: result.user.uid,
                token: newJwtToken,
            });
            await JwtAuthService.setJWTToken(newJwtToken);
            return result;
        } catch (error) {
            Log.error("Error signing in with Google", error);
        }
    }

    /**
     * Sign out the current user.
     */
    static async signOut() {
        try {
            await firebaseAuth.signOut();
            await removeSession();
            JwtAuthService.setJWTToken(null);
        } catch (error) {
            Log.error("Error signing out", error);
            throw error;
        }
    }

    /**
     * Sign in using email and password.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns The result of the email/password sign-in.
     */
    static async signInWithEmailAndPassword(email: string, password: string) {
        try {
            const result = await signInWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            );
            if (!result || !result.user) {
                throw new Error("Email/password sign-in failed");
            }
            // await createSession(result.user.uid);
            return result;
        } catch (error) {
            Log.error("Error signing in with email and password", error);
        }
    }

    // /**
    //  * Create a new user with email and password.
    //  * @param email - The user's email.
    //  * @param password - The user's password.
    //  * @returns The result of the user creation.
    //  */
    // static async createUserWithEmailAndPassword(email: string, password: string) {
    //   try {
    //     const result = await createUserWithEmailAndPassword(
    //       firebaseAuth,
    //       email,
    //       password
    //     );
    //     return result;
    //   } catch (error) {
    //     Log.error("Error creating user with email and password", error);
    //     throw error;
    //   }
    // }
}
