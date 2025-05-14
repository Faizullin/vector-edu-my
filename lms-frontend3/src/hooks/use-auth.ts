import { simpleRequest } from "@/client/core/simpleRequest";
import type { AuthUser } from "@/client/types.gen";
import {
  clearAuthStorage,
  isLoggedIn,
  setAuthStorageLoggedIn,
} from "@/utils/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery<AuthUser | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const data = await simpleRequest<AuthUser>({
        url: "/auth/me/",
        method: "GET",
      });

      const authInfo = {
        isLoggedIn: true,
        user: data,
      };

      localStorage.setItem("auth", JSON.stringify(authInfo));
      return data;
    },
    enabled: isLoggedIn(),
  });

  const loginMutation = useMutation({
    mutationFn: async (cred: any) => {
      const data = await simpleRequest({
        url: "/auth/login/",
        method: "POST",
        formData: cred,
      });
      setAuthStorageLoggedIn(true);
      return data;
    },
    onSuccess: () => {
      navigate({ to: "/" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      simpleRequest({
        url: "/auth/logout/",
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.clear();
      clearAuthStorage();
      navigate({ to: "/sign-in" });
    },
    onError: () => {
      queryClient.clear();
      clearAuthStorage();
      navigate({ to: "/sign-in" });
    },
  });

  return {
    loginMutation,
    logoutMutation,
    user,
    error,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;
