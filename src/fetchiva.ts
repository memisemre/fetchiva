import { getConfig } from "./config";
import type {
  FetchivaRequestContext,
  FetchivaRequestOptions,
  FetchivaResponse,
} from "./types";

function buildURL(path: string, baseURL?: string): string {
  const base = baseURL ?? getConfig().baseURL;

  if (!base) {
    return path;
  }

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

function mergeHeaders(
  requestHeaders?: Record<string, string>
): Record<string, string> {
  const globalHeaders = getConfig().headers ?? {};
  return { ...globalHeaders, ...requestHeaders };
}

function getTimeout(requestTimeout?: number): number | undefined {
  return requestTimeout ?? getConfig().timeout;
}

type HttpMethodOptions = Omit<FetchivaRequestOptions, "method" | "body">;

export async function fetchiva<T = unknown>(
  path: string,
  options: FetchivaRequestOptions = {}
): Promise<FetchivaResponse<T>> {
  const config = getConfig();
  const { baseURL, headers, timeout, ...fetchOptions } = options;

  const url = buildURL(path, baseURL);
  const mergedHeaders = mergeHeaders(headers);
  const finalTimeout = getTimeout(timeout);

  let controller: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (finalTimeout !== undefined) {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller!.abort(), finalTimeout);
  }

  let requestContext: FetchivaRequestContext = {
    url,
    options: {
      ...fetchOptions,
      headers: mergedHeaders,
      signal: controller?.signal ?? options.signal,
    },
  };

  try {
    if (config.onRequest) {
      const modifiedContext = await config.onRequest(requestContext);
      if (modifiedContext) {
        requestContext = modifiedContext;
      }
    }

    const response = await fetch(requestContext.url, requestContext.options);

    const data = (await response.json()) as T;

    let result: FetchivaResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
    };

    if (config.onResponse) {
      const modifiedResponse = await config.onResponse(result);
      if (modifiedResponse) {
        result = modifiedResponse as FetchivaResponse<T>;
      }
    }

    return result;
  } catch (error) {
    if (config.onError) {
      await config.onError(error as Error);
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function get<T = unknown>(
  path: string,
  options: HttpMethodOptions = {}
): Promise<FetchivaResponse<T>> {
  return fetchiva<T>(path, { ...options, method: "GET" });
}

export function post<T = unknown>(
  path: string,
  body?: BodyInit | null,
  options: HttpMethodOptions = {}
): Promise<FetchivaResponse<T>> {
  return fetchiva<T>(path, { ...options, method: "POST", body });
}

export function put<T = unknown>(
  path: string,
  body?: BodyInit | null,
  options: HttpMethodOptions = {}
): Promise<FetchivaResponse<T>> {
  return fetchiva<T>(path, { ...options, method: "PUT", body });
}

export function patch<T = unknown>(
  path: string,
  body?: BodyInit | null,
  options: HttpMethodOptions = {}
): Promise<FetchivaResponse<T>> {
  return fetchiva<T>(path, { ...options, method: "PATCH", body });
}

export function del<T = unknown>(
  path: string,
  options: HttpMethodOptions = {}
): Promise<FetchivaResponse<T>> {
  return fetchiva<T>(path, { ...options, method: "DELETE" });
}
