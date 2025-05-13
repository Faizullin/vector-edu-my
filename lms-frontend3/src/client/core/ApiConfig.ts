import type { AxiosRequestConfig, AxiosResponse } from "axios";

type Middleware<T> = (value: T) => T | Promise<T>;

export class Interceptors<T> {
  _fns: Middleware<T>[];

  constructor() {
    this._fns = [];
  }

  eject(fn: Middleware<T>): void {
    const index = this._fns.indexOf(fn);
    if (index !== -1) {
      this._fns = [...this._fns.slice(0, index), ...this._fns.slice(index + 1)];
    }
  }

  use(fn: Middleware<T>): void {
    this._fns = [...this._fns, fn];
  }
}

export type ApiConfigType = {
  BASE: string;
  VERSION: string;
  CREDENTIALS: "include" | "omit" | "same-origin";
  ENCODE_PATH?: ((path: string) => string) | undefined;
  WITH_CREDENTIALS: boolean;
  interceptors: {
    request: Interceptors<AxiosRequestConfig>;
    response: Interceptors<AxiosResponse>;
  };
};

const windowUrl = (window as any)?.VITE_APP_API_URL;

export const ApiConfig: ApiConfigType = {
  BASE: `${windowUrl || import.meta.env.VITE_APP_API_URL}/api/v1/lms`,
  CREDENTIALS: "include",
  ENCODE_PATH: undefined,
  VERSION: "v1",
  WITH_CREDENTIALS: false,
  interceptors: {
    request: new Interceptors(),
    response: new Interceptors(),
  },
};
