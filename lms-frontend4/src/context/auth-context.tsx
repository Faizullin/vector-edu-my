"use client";

import { createSession } from "@/actions/auth-actions";
import { URLS } from "@/config/constants";
import { FirebaseAuthService } from "@/lib/firebase/auth";
import { JwtAuthService } from "@/lib/jwt-auth-service";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/types";
import { User } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  firebaseUser: User | null;
  user: AuthUser | null;
  updateUserData: (newUserData: Partial<AuthUser>) => void;
}

// Create the authentication context
export const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  updateUserData: () => {
    throw new Error("updateUserData function must be implemented");
  },
});

type AuthContextProviderProps = PropsWithChildren;

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { redirectFn } = useSignInSuccessRedirect();

  const updateUserData = useCallback(
    (newUserData: Partial<AuthUser>) => {
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      JwtAuthService.setStorageData(
        {
          user: updatedUser,
        },
        {
          partial: true,
        }
      );
    },
    [user]
  );

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (user) => {
      if (user) {
        const initialStorageData = await JwtAuthService.getStorageData();
        if (!initialStorageData) {
          const userToken = await user.getIdToken();
          let newStorageData: {
            token: string;
            user: AuthUser;
          } | null = null;
          try {
            const newData =
              (await JwtAuthService.loginWithFirebaseToken(userToken)) || null;
            if (!newData) {
              throw new Error("Failed to obtain JWT token from Firebase token");
            }
            newStorageData = newData;
            await createSession({
              uid: user.uid,
              token: newStorageData.token,
            });
          } catch {
            await FirebaseAuthService.signOut();
          }
          if (newStorageData) {
            setUser(newStorageData.user);
            setFirebaseUser(user);
            redirectFn();
          } else {
            setUser(null);
            setFirebaseUser(null);
          }
        } else {
          setUser(initialStorageData.user);
          setFirebaseUser(user);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [redirectFn]);

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ firebaseUser, user, updateUserData }}>
      {loading ? (
        <div className="w-full h-svh flex flex-col justify-center items-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "animate-spin text-primary",
                "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
              )}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-muted-foreground text-sm sm:text-base animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// hook fore recorect on searh params
const useSignInSuccessRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectFn = useCallback(() => {
    const redirectUrl = searchParams?.get("redirect") || URLS.HOME;
    router.replace(redirectUrl, {
      scroll: false,
    });
  }, [router, searchParams]);
  return { redirectFn };
};
