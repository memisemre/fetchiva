export { configureFetchiva } from "./config";
export {
  FetchivaError,
  HttpError,
  isFetchivaError,
  isHttpError,
  isNetworkError,
  isTimeoutError,
  NetworkError,
  TimeoutError,
} from "./errors";
export { fetchiva, get, post, put, patch, del } from "./fetchiva";

export type {
  FetchivaConfig,
  FetchivaRequestContext,
  FetchivaRequestOptions,
  FetchivaResponse,
  OnErrorHook,
  OnRequestHook,
  OnResponseHook,
  RetryConfig,
} from "./types";

export type { FetchivaErrorType } from "./errors";
