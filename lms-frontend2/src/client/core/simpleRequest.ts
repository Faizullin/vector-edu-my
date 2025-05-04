import { request as __request } from "@/client/core/request";
import axios, { AxiosInstance } from "axios";
import { ApiConfig } from "./ApiConfig";
import { ApiRequestOptions } from "./ApiRequestOptions";

export const simpleRequest = <T>(
    options: ApiRequestOptions<T>,
    axiosClient: AxiosInstance = axios,
) => {
    return __request(ApiConfig, options, axiosClient);
}