export interface FetchivaResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

export interface FetchivaRequestContext {
  url: string;
  options: RequestInit;
}

export type OnRequestHook = (
  context: FetchivaRequestContext
) => FetchivaRequestContext | void | Promise<FetchivaRequestContext | void>;

export type OnResponseHook = <T = unknown>(
  response: FetchivaResponse<T>
) => FetchivaResponse<T> | void | Promise<FetchivaResponse<T> | void>;

export type OnErrorHook = (error: Error) => void | Promise<void>;

export interface RetryConfig {
  retries?: number;
  retryDelay?: number;
}

export interface FetchivaConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
  onRequest?: OnRequestHook;
  onResponse?: OnResponseHook;
  onError?: OnErrorHook;
}

export interface FetchivaRequestOptions extends Omit<RequestInit, "headers"> {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
}
