"use client"

import { toaster } from "@/components/ui/toaster"

const useCustomToast = () => {
  const showSuccessToast = (data: string | {
    title: string
    description: string
  }) => {
    const toastData = typeof data === "string" ? { title: "Success!", description: data } : data;
    toaster.create(toastData);
  }

  const showErrorToast = (data: string | {
    title: string
    description: string
  }) => {
    const toastData = typeof data === "string" ? { title: "Something went wrong!", description: data } : data;
    toaster.create(toastData);
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
