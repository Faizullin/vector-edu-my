import { ApiError } from "@/client"
import { simpleRequest } from "@/client/core/simpleRequest"
import { AuthUser } from "@/client/types.gen"
import { handleError } from "@/utils/handleError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"


interface AuthStorageCreds {
    isLoggedIn: boolean;
    user: {
        id: number;
        username: string;
        email: string;
    } | null;
}

const getAuthStorageData = () => {
    const authStr = localStorage.getItem("auth");
    let data: AuthStorageCreds = {
        isLoggedIn: false,
        user: null,
    }
    if (!authStr) {
        localStorage.setItem("auth", JSON.stringify(data))
        return data
    }
    try {
        data = JSON.parse(authStr)
    } catch (e) {

    }
    return data
}

const setAuthStorageLoggedIn = (isLoggedIn: boolean) => {
    const data = getAuthStorageData()
    data.isLoggedIn = isLoggedIn
    localStorage.setItem("auth", JSON.stringify(data))
    return data
}

const isLoggedIn = () => {
    const data = getAuthStorageData()
    return data.isLoggedIn;
}

const useAuth = () => {
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: user, } = useQuery<AuthUser | null, Error>({
        queryKey: ["currentUser"],
        queryFn: async () => {
            return simpleRequest({
                url: "/auth/me/",
                method: "GET",
            }).then((data: any) => {
                localStorage.setItem("auth", JSON.stringify({
                    isLoggedIn: true,
                    user: {
                        id: data.id,
                        username: data.username,
                        email: data.email,
                    },
                }))
                return data
            });
        },
        enabled: isLoggedIn(),
    })

    //   const signUpMutation = useMutation({
    //     mutationFn: (data: UserRegister) =>
    //       UsersService.registerUser({ requestBody: data }),

    //     onSuccess: () => {
    //       navigate({ to: "/login" })
    //     },
    //     onError: (err: ApiError) => {
    //       handleError(err)
    //     },
    //     onSettled: () => {
    //       queryClient.invalidateQueries({ queryKey: ["users"] })
    //     },
    //   })



    const loginMutation = useMutation({
        mutationFn: (cred: any) => {
            return simpleRequest({
                url: "/auth/login/",
                method: "POST",
                formData: cred,
            }).then(() => {
                setAuthStorageLoggedIn(true);
            });;
        },
        onSuccess: () => {
            navigate({ to: "/" })
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
    })

    const logoutMutation = useMutation({
        mutationFn: () => simpleRequest({
            url: "/auth/logout/",
            method: "POST",
        }),
        onSuccess: () => {
            queryClient.clear()
            navigate({ to: '/login' })
        },
    });

    return {
        loginMutation,
        logoutMutation,
        user,
        error,
        resetError: () => setError(null),
    }
}

export { isLoggedIn }
export default useAuth
