import { showToast } from "@/utils/handle-server-error";

export const useCustomToast = () => {
  const showSuccessToast = (
    data:
      | string
      | {
          title: string;
          description?: string;
          duration?: number;
        }
  ) => {
    const toastData =
      typeof data === "string"
        ? { title: "Success!", description: data }
        : data;
    showToast("error", {
      message: toastData.title,
      data: {
        description: toastData.description,
        duration: toastData.duration,
      },
    });
  };

  const showErrorToast = (
    data:
      | string
      | {
          title: string;
          description?: string;
          duration?: number;
        }
  ) => {
    const toastData =
      typeof data === "string"
        ? { title: "Something went wrong!", description: data }
        : data;
    showToast("error", {
      message: toastData.title,
      data: {
        description: toastData.description,
        duration: toastData.duration,
      },
    });
  };

  return { showSuccessToast, showErrorToast };
};
