import { request as __request } from "@/client/core/request";
import { setAuthStorageLoggedIn } from "@/utils/auth";
import axios, { type AxiosInstance } from "axios";
import { ApiConfig } from "./ApiConfig";
import { ApiError } from "./ApiError";
import type { ApiRequestOptions } from "./ApiRequestOptions";

export const simpleRequest = <T>(
  options: ApiRequestOptions<T>,
  axiosClient: AxiosInstance = axios,
) => {
  return __request(ApiConfig, options, axiosClient).catch((error) => {
    const my_error = error as ApiError;
    if (my_error.message === "Unauthorized") {
      setAuthStorageLoggedIn(false);
      window.location.href = "/login";
    }
    throw error;
  });
};
