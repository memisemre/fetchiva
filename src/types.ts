export interface FetchivaConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface FetchivaRequestOptions extends Omit<RequestInit, "headers"> {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface FetchivaResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}
