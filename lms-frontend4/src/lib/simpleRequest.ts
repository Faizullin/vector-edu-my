import { BASE_API_URL } from "@/config/constants";
import { JwtAuthService } from "./firebase/jwt-auth";

interface RequestBaseProps {
  url: string;
  params?: Record<string, any>;
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
  body?: Record<string, any> | FormData;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: any;
  public readonly url: string;
  public readonly method: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data: any,
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
  auth: { token?: string; disable?: boolean } | undefined;
  headers?: Record<string, any>;
}) => {
  const headersWithBearer: Record<string, any> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (auth && !auth.disable) {
    if (!auth.token) {
      throw new Error("Authorization token is required");
    }
    headersWithBearer["Authorization"] = `Token ${auth.token}`;
  } else {
    const token = await JwtAuthService.getJWTToken();
    if (token) {
      headersWithBearer["Authorization"] = `Token ${token}`;
    }
  }
  return headersWithBearer;
};

export const getUrl = ({
  url,
  params = {},
  urlPrefix = "/api/v1/lms",
}: {
  url: string;
  params?: Record<string, any>;
  urlPrefix?: string;
}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${BASE_API_URL}${
    queryString ? `${urlPrefix}${url}/?${queryString}` : `${urlPrefix}${url}/`
  }`;
};

export async function simpleRequest<T>({
  url,
  params = {},
  headers = {},
  signal,
  auth,
  urlPrefix = "/api/v1/lms",
  ...props
}: RequestGetProps | RequestPostProps): Promise<T | undefined> {
  const fullUrl = getUrl({
    url,
    params: params,
    urlPrefix,
  });

  const headersWithBearer = await getAuthHeaders({
    headers,
    auth,
  });
  let response;
  const method = props.method || "GET";
  if (method === "GET") {
    response = await fetch(fullUrl, {
      method,
      headers: headersWithBearer,
      signal,
    });
  } else {
    response = await fetch(fullUrl, {
      method,
      headers: headersWithBearer,
      body: JSON.stringify((props as RequestPostProps).body),
      signal,
    });
  }
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;
    let errorData: any;
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
      method
    );
  }

  if (response.status === 204) {
    // No content response, return an empty object
    return;
  }

  return response.json();
}
