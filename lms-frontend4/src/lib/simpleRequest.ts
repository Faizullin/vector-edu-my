interface RequestBaseProps {
  url: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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

export async function simpleRequest<T>({
  url,
  params = {},
  headers = {},
  signal,
}: RequestGetProps | RequestPostProps): Promise<T> {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
