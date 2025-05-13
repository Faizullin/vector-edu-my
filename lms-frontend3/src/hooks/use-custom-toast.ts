import { toast } from "sonner";

export const useCustomToast = () => {
  const showSuccessToast = (
    data:
      | string
      | {
          title: string;
          description?: string;
          duration?: number;
        },
  ) => {
    const toastData =
      typeof data === "string"
        ? { title: "Success!", description: data }
        : data;
    toast.message(toastData.title, {
      description: toastData.description,
      duration: toastData.duration,
    });
  };

  const showErrorToast = (
    data:
      | string
      | {
          title: string;
          description?: string;
          duration?: number;
        },
  ) => {
    const toastData =
      typeof data === "string"
        ? { title: "Something went wrong!", description: data }
        : data;
    toast.error(toastData.title, {
      description: toastData.description,
      duration: toastData.duration,
    });
  };

  return { showSuccessToast, showErrorToast };
};
