/**
 * Response object returned by fetchiva requests.
 * @template T - The type of the response data
 */
export interface FetchivaResponse<T = unknown> {
  /** The parsed JSON response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Headers;
  /** Whether the response was successful (status 200-299) */
  ok: boolean;
}

/**
 * Context object passed to request hooks.
 */
export interface FetchivaRequestContext {
  /** The full URL of the request */
  url: string;
  /** The fetch options for the request */
  options: RequestInit;
}

/**
 * Hook function called before each request.
 * Can modify the request context or return void to use the original.
 * @param context - The request context containing URL and options
 * @returns Modified context, void, or a Promise resolving to either
 */
export type OnRequestHook = (
  context: FetchivaRequestContext
) => FetchivaRequestContext | void | Promise<FetchivaRequestContext | void>;

/**
 * Hook function called after each successful response.
 * Can modify the response or return void to use the original.
 * @template T - The type of the response data
 * @param response - The response object
 * @returns Modified response, void, or a Promise resolving to either
 */
export type OnResponseHook = <T = unknown>(
  response: FetchivaResponse<T>
) => FetchivaResponse<T> | void | Promise<FetchivaResponse<T> | void>;

/**
 * Hook function called when an error occurs.
 * @param error - The error that occurred
 * @returns void or a Promise resolving to void
 */
export type OnErrorHook = (error: Error) => void | Promise<void>;

/**
 * Configuration for automatic request retries.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 0) */
  retries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Global configuration options for fetchiva.
 */
export interface FetchivaConfig {
  /** Base URL to prepend to all request paths */
  baseURL?: string;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Retry configuration for failed requests */
  retry?: RetryConfig;
  /** Hook called before each request */
  onRequest?: OnRequestHook;
  /** Hook called after each successful response */
  onResponse?: OnResponseHook;
  /** Hook called when an error occurs */
  onError?: OnErrorHook;
}

/**
 * Options for individual fetchiva requests.
 * Extends native RequestInit with additional fetchiva-specific options.
 */
export interface FetchivaRequestOptions extends Omit<RequestInit, "headers"> {
  /** Base URL to prepend to the request path (overrides global config) */
  baseURL?: string;
  /** Headers for this request (merged with global headers) */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (overrides global config) */
  timeout?: number;
  /** Retry configuration (merged with global config) */
  retry?: RetryConfig;
}
