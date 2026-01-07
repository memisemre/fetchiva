export type FetchivaErrorType = "network" | "timeout" | "http";

export interface FetchivaErrorOptions {
  cause?: Error;
  url?: string;
  method?: string;
}

export interface HttpErrorOptions extends FetchivaErrorOptions {
  status: number;
  statusText: string;
}

export class FetchivaError extends Error {
  readonly type: FetchivaErrorType;
  readonly url?: string;
  readonly method?: string;

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

export class NetworkError extends FetchivaError {
  constructor(message: string, options?: FetchivaErrorOptions) {
    super("network", message, options);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends FetchivaError {
  constructor(message: string, options?: FetchivaErrorOptions) {
    super("timeout", message, options);
    this.name = "TimeoutError";
  }
}

export class HttpError extends FetchivaError {
  readonly status: number;
  readonly statusText: string;

  constructor(message: string, options: HttpErrorOptions) {
    super("http", message, options);
    this.name = "HttpError";
    this.status = options.status;
    this.statusText = options.statusText;
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function isFetchivaError(error: unknown): error is FetchivaError {
  return error instanceof FetchivaError;
}
