import { ApiError } from "@/client";
import type { UseFormReturn } from "react-hook-form";
import { toast, type ExternalToast } from "sonner";
import { Log } from "./log";

type titleT = (() => React.ReactNode) | React.ReactNode;
export function showToast(
  type: "error" | "success",
  data: {
    message: titleT | React.ReactNode;
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
    message: string;
    detail: string;
  }>;
};

function getApiErrorData(error: ApiError) {
  const errorBody = error.body as any;
  if (error.message === "Bad Request") {
    if (errorBody["type"] === "validation_error") {
      const errorBody = error.body as ValidationError<string>;
      return errorBody;
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
  form?: UseFormReturn<any, any, any>;
};
export function handleServerError(
  error: unknown,
  options: HandleServerErrorType = {
    displayType: "toast",
  }
) {
  const { form } = options;
  const displayType = options.displayType || "toast";
  if (error instanceof ApiError) {
    const errorBody = getApiErrorData(error);
    Log.error("handleServerError", error, error.body);
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
    } else if (errorBody?.type === "simple_error") {
      if (displayType === "toast") {
        showToast("error", {
          message: errorBody.error,
        });
      }
    }
    return errorBody;
  } else {
  }
}
