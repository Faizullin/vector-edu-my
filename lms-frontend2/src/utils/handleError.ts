import type { ApiError } from "@/client"
import { Log } from "./log"

export const handleError = (err: ApiError) => {
    Log.error("handleError", err)
    // const errDetail = (err.body as any)?.detail
    // let errorMessage = errDetail || "Something went wrong."
    // if (Array.isArray(errDetail) && errDetail.length > 0) {
    //     errorMessage = errDetail[0].msg
    // }
    // showErrorToast(errorMessage)
}
