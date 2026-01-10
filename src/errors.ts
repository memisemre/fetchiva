/**
 * Types of errors that can occur during fetchiva requests.
 */
export type FetchivaErrorType = "network" | "timeout" | "http";

/**
 * Options for creating a FetchivaError.
 */
export interface FetchivaErrorOptions {
  /** The underlying cause of the error */
  cause?: Error;
  /** The URL of the request that failed */
  url?: string;
  /** The HTTP method of the request that failed */
  method?: string;
}

/**
 * Options for creating an HttpError.
 */
export interface HttpErrorOptions extends FetchivaErrorOptions {
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
}

/**
 * Base error class for all fetchiva errors.
 * Provides additional context about the failed request.
 */
export class FetchivaError extends Error {
  /** The type of error that occurred */
  readonly type: FetchivaErrorType;
  /** The URL of the request that failed */
  readonly url?: string;
  /** The HTTP method of the request that failed */
  readonly method?: string;

  /**
   * Creates a new FetchivaError.
   * @param type - The type of error (network, timeout, or http)
   * @param message - Human-readable error message
   * @param options - Additional error context
   */
  constructor(
    type: FetchivaErrorType,
    message: string,
    options?: FetchivaErrorOptions
  ) {
    super(message, { cause: options?.cause });
    this.name = "FetchivaError";
    this.type = type;
    this.url = options?.url;
    this.method = options?.method;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when a network failure occurs.
 * This includes DNS failures, connection refused, and other network-level issues.
 */
export class NetworkError extends FetchivaError {
  /**
   * Creates a new NetworkError.
   * @param message - Human-readable error message
   * @param options - Additional error context
   */
  constructor(message: string, options?: FetchivaErrorOptions) {
    super("network", message, options);
    this.name = "NetworkError";
  }
}

/**
 * Error thrown when a request times out.
 * Occurs when the request exceeds the configured timeout duration.
 */
export class TimeoutError extends FetchivaError {
  /**
   * Creates a new TimeoutError.
   * @param message - Human-readable error message
   * @param options - Additional error context
   */
  constructor(message: string, options?: FetchivaErrorOptions) {
    super("timeout", message, options);
    this.name = "TimeoutError";
  }
}

/**
 * Error thrown when the server returns a non-OK HTTP status code.
 * Contains the HTTP status code and status text for debugging.
 */
export class HttpError extends FetchivaError {
  /** HTTP status code (e.g., 404, 500) */
  readonly status: number;
  /** HTTP status text (e.g., "Not Found", "Internal Server Error") */
  readonly statusText: string;

  /**
   * Creates a new HttpError.
   * @param message - Human-readable error message
   * @param options - Error options including status code and status text
   */
  constructor(message: string, options: HttpErrorOptions) {
    super("http", message, options);
    this.name = "HttpError";
    this.status = options.status;
    this.statusText = options.statusText;
  }
}

/**
 * Type guard to check if an error is a NetworkError.
 * @param error - The error to check
 * @returns True if the error is a NetworkError
 * @example
 * ```ts
 * try {
 *   await fetchiva('/api/data');
 * } catch (error) {
 *   if (isNetworkError(error)) {
 *     console.log('Network failed:', error.message);
 *   }
 * }
 * ```
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if an error is a TimeoutError.
 * @param error - The error to check
 * @returns True if the error is a TimeoutError
 * @example
 * ```ts
 * try {
 *   await fetchiva('/api/data', { timeout: 5000 });
 * } catch (error) {
 *   if (isTimeoutError(error)) {
 *     console.log('Request timed out');
 *   }
 * }
 * ```
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Type guard to check if an error is an HttpError.
 * @param error - The error to check
 * @returns True if the error is an HttpError
 * @example
 * ```ts
 * try {
 *   await fetchiva('/api/data');
 * } catch (error) {
 *   if (isHttpError(error)) {
 *     console.log('HTTP error:', error.status);
 *   }
 * }
 * ```
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Type guard to check if an error is any FetchivaError.
 * @param error - The error to check
 * @returns True if the error is a FetchivaError (including NetworkError, TimeoutError, HttpError)
 * @example
 * ```ts
 * try {
 *   await fetchiva('/api/data');
 * } catch (error) {
 *   if (isFetchivaError(error)) {
 *     console.log('Fetchiva error:', error.type, error.url);
 *   }
 * }
 * ```
 */
export function isFetchivaError(error: unknown): error is FetchivaError {
  return error instanceof FetchivaError;
}
