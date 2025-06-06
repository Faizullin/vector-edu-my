import { ApiError } from "@/client"
import { simpleRequest } from "@/client/core/simpleRequest"
import { AuthUser } from "@/client/types.gen"
import { isLoggedIn, setAuthStorageLoggedIn } from "@/utils/auth"
import { handleError } from "@/utils/handleError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

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
