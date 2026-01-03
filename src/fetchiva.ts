import { getConfig } from "./config";
import type { FetchivaRequestOptions, FetchivaResponse } from "./types";

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

export async function fetchiva<T = unknown>(
  path: string,
  options: FetchivaRequestOptions = {}
): Promise<FetchivaResponse<T>> {
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

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: mergedHeaders,
      signal: controller?.signal ?? options.signal,
    });

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
