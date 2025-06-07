import { BASE_API_URL } from "@/config/constants";
import { JwtAuthService } from "./jwt-auth-service";

interface RequestBaseProps {
  url: string;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  auth?: {
    token?: string;
    disable?: boolean;
  };
  urlPrefix?: string;
}

interface RequestGetProps extends RequestBaseProps {
  url: string;
  method?: "GET";
}

interface RequestPostProps extends RequestBaseProps {
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | FormData;
}

const useDevApiEnabled = process.env.NEXT_PUBLIC_USE_DEV_API_ENABLED === "true";

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: unknown;
  public readonly url: string;
  public readonly method: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data: unknown,
    url: string,
    method: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.url = url;
    this.method = method;
    this.timestamp = new Date();

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      data: this.data,
      url: this.url,
      method: this.method,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export const getAuthHeaders = async ({
  headers,
  auth,
}: {
  auth?: { token?: string; disable?: boolean };
  headers?: Record<string, unknown>;
}) => {
  const headersWithBearer: Record<string, unknown> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (auth && !auth.disable) {
    if (!auth.token) {
      throw new Error("Authorization token is required");
    }
    headersWithBearer["Authorization"] = `Token ${auth.token}`;
  } else {
    const token = (await JwtAuthService.getStorageData())?.token;
    if (token) {
      headersWithBearer["Authorization"] = `Token ${token}`;
    }
  }
  return headersWithBearer as HeadersInit;
};

export const getUrl = ({
  url,
  params = {},
  urlPrefix = "/api/v1/lms",
}: {
  url: string;
  params?: Record<string, string | number | boolean>;
  urlPrefix?: string;
}) => {
  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  const baseApiUrl = useDevApiEnabled ? "http://localhost:3000" : BASE_API_URL;
  return `${baseApiUrl}${queryString ? `${urlPrefix}${url}/?${queryString}` : `${urlPrefix}${url}/`
    }`;
};

const getPostBody = (body: Record<string, unknown> | FormData) => {
  if (body instanceof FormData) {
    return body;
  }
  return JSON.stringify(body);
};

export async function simpleRequest<T>(props: RequestGetProps | RequestPostProps): Promise<T | undefined> {
  const { url, params, headers, signal, auth, urlPrefix = "/api/v1/lms" } = props;
  const fullUrl = getUrl({
    url,
    params: params,
    urlPrefix,
  });
  const headersWithBearer: Record<string, any> = {
    ...await getAuthHeaders({
      headers,
      auth,
    })
  };
  let response;
  if (props.method === undefined || props.method === "GET") {
    response = await fetch(fullUrl, {
      method: props.method,
      headers: headersWithBearer,
      signal,
    });
  } else if (
    props.method === "POST" || props.method === "PUT" || props.method === "PATCH" || props.method === "DELETE"
  ) {
    if (props.body && (props.body instanceof FormData)) {
      delete headersWithBearer["Content-Type"]; // FormData sets its own Content-Type
    }
    response = await fetch(fullUrl, {
      method: props.method,
      headers: headersWithBearer,
      body: getPostBody(props.body!),
      signal,
    });
  } else {
    throw new Error(`Unsupported HTTP method: ${props.method}`);
  }
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;
    let errorData: unknown;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { detail: await response.text() };
      }
    } catch {
      errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new ApiError(
      `HTTP: ${statusText}`,
      status,
      statusText,
      errorData,
      url,
      props.method || "GET"
    );
  }

  if (response.status === 204) {
    // No content response, return an empty object
    return;
  }

  return response.json();
}
