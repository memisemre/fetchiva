export { configureFetchiva } from "./config";
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
