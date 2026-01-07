import { getConfig } from "./config";
import {
  HttpError,
  NetworkError,
  TimeoutError,
  type FetchivaError,
} from "./errors";
import type {
  FetchivaRequestContext,
  FetchivaRequestOptions,
  FetchivaResponse,
  RetryConfig,
} from "./types";

const DEFAULT_RETRY_DELAY = 1000;

function isRetryableError(error: Error): boolean {
  if (error instanceof TimeoutError || error instanceof NetworkError) {
    return true;
  }
  if (error instanceof HttpError) {
    return error.status >= 500 && error.status < 600;
  }
  return (
    error.name === "TypeError" ||
    error.name === "AbortError" ||
    error.message.includes("network") ||
    error.message.includes("fetch")
  );
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

function isTimeoutAbort(error: Error, controller?: AbortController): boolean {
  return error.name === "AbortError" && controller?.signal.aborted === true;
}

function isNetworkLikeError(error: Error): boolean {
  return (
    error.name === "TypeError" ||
    error.message.includes("network") ||
    error.message.includes("fetch") ||
    error.message.includes("Failed to fetch")
  );
}

function getRetryConfig(requestRetry?: RetryConfig): RetryConfig {
  const globalRetry = getConfig().retry ?? {};
  return { ...globalRetry, ...requestRetry };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const { baseURL, headers, timeout, retry, ...fetchOptions } = options;

  const url = buildURL(path, baseURL);
  const mergedHeaders = mergeHeaders(headers);
  const finalTimeout = getTimeout(timeout);
  const retryConfig = getRetryConfig(retry);
  const maxRetries = retryConfig.retries ?? 0;
  const retryDelay = retryConfig.retryDelay ?? DEFAULT_RETRY_DELAY;

  let attempt = 0;
  let lastError: Error | undefined;

  while (attempt <= maxRetries) {
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

      if (isRetryableStatus(response.status) && attempt < maxRetries) {
        attempt++;
        if (timeoutId) clearTimeout(timeoutId);
        await delay(retryDelay);
        continue;
      }

      if (!response.ok) {
        const httpError = new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          {
            status: response.status,
            statusText: response.statusText,
            url: requestContext.url,
            method: requestContext.options.method,
          }
        );

        if (config.onError) {
          await config.onError(httpError);
        }
        throw httpError;
      }

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
      const rawError = error as Error;
      let fetchivaError: FetchivaError | Error;

      if (isTimeoutAbort(rawError, controller)) {
        fetchivaError = new TimeoutError(
          `Request timeout after ${finalTimeout}ms`,
          {
            cause: rawError,
            url: requestContext.url,
            method: requestContext.options.method,
          }
        );
      } else if (isNetworkLikeError(rawError)) {
        fetchivaError = new NetworkError(rawError.message || "Network error", {
          cause: rawError,
          url: requestContext.url,
          method: requestContext.options.method,
        });
      } else {
        fetchivaError = rawError;
      }

      lastError = fetchivaError;

      if (isRetryableError(fetchivaError) && attempt < maxRetries) {
        attempt++;
        if (timeoutId) clearTimeout(timeoutId);
        await delay(retryDelay);
        continue;
      }

      if (config.onError) {
        await config.onError(fetchivaError);
      }
      throw fetchivaError;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  if (config.onError && lastError) {
    await config.onError(lastError);
  }
  throw lastError;
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
