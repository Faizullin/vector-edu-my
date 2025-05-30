"use client";

import { createSession } from "@/actions/auth-actions";
import { FirebaseAuthService } from "@/lib/firebase/auth";
import { User } from "firebase/auth";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
}

// Create the authentication context
export const AuthContext = createContext<AuthContextType>({
  user: null,
});

interface AuthContextProviderProps extends PropsWithChildren {}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  // Set up state to track the authenticated user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to the authentication state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
      // Set loading to false once authentication state is determined
      setLoading(false);
    });

    // Unsubscribe from the authentication state changes when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? <div>Loading...</div> : children}
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
