import {ApiError} from "@/lib/simpleRequest";
import type {UseFormReturn} from "react-hook-form";
import {type ExternalToast, toast} from "sonner";
import {Log} from "./log";
import {ReactNode} from "react";

type titleT = (() => ReactNode) | ReactNode;

export function showToast(
    type: "error" | "success",
    data: {
        message: titleT | ReactNode;
        data?: ExternalToast;
    }
) {
    const defaultDuration = 5000;
    if (type === "error") {
        toast.error(data.message, {
            ...data.data,
            duration: defaultDuration,
        });
    } else {
        toast.success(data.message, {
            ...data.data,
            duration: defaultDuration,
        });
    }
}

type ValidationError<TAttr> = {
    type: "validation_error";
    errors: Array<{
        attr: TAttr;
        code: string;
        detail: string;
    }>;
};

type ServerError = {
    type: "server_error";
    errors: [
        {
            attr: null;
            code: "error";
            detail: string;
        }
    ];
};

export function getApiErrorData(error: ApiError) {
    const errorBody = error.data as Record<string, unknown>;
    if (error.message.startsWith("HTTP: ")) {
        const errorMessageSliced = error.message.slice(6);
        if (errorMessageSliced === "Bad Request") {
            if (errorBody["type"] === "validation_error") {
                return error.data as ValidationError<string>;
            }
        }
        if (errorMessageSliced === "Internal Server Error") {
            if (errorBody["type"] === "server_error") {
                return errorBody as ServerError;
            }
        }
    }
    if (errorBody.error) {
        return errorBody as {
            type: "simple_error";
            error: string;
        };
    }
}

type HandleServerErrorType = {
    displayType?: "toast" | "alert";
    form?: UseFormReturn;
};

export function handleServerError(
    error: Error,
    options: HandleServerErrorType = {
        displayType: "toast",
    }
) {
    const {form} = options;
    const displayType = options.displayType || "toast";
    if (error instanceof ApiError) {
        Log.error("handleServerError", error.toJSON());
        const errorBody = getApiErrorData(error);
        if (errorBody?.type === "validation_error") {
            if (displayType === "toast") {
                showToast("error", {
                    message: "Validation Error",
                    data: {
                        description: error.message,
                    },
                });
            }
            if (form) {
                errorBody.errors.forEach((errItem) => {
                    form.setError(errItem.attr, {
                        type: "manual",
                        message: errItem.detail,
                    });
                });
            }
        } else if (errorBody?.type === "server_error") {
            if (displayType === "toast") {
                showToast("error", {
                    message: "Server Error",
                    data: {
                        description: errorBody.errors[0].detail,
                    },
                });
            }
        } else if (errorBody?.type === "simple_error") {
            if (displayType === "toast") {
                showToast("error", {
                    message: errorBody.error,
                });
            }
        }
        return errorBody;
    } else {
        Log.error("handleServerError", error);
    }
}
