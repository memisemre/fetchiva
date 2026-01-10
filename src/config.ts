import type { FetchivaConfig } from "./types";

let globalConfig: FetchivaConfig = {};

/**
 * Configures global settings for all fetchiva requests.
 * Settings include base URL, default headers, timeout, retry behavior, and lifecycle hooks.
 * @param config - The configuration options to set
 * @example
 * ```ts
 * configureFetchiva({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' },
 *   timeout: 5000,
 *   retry: { retries: 3, retryDelay: 1000 },
 *   onError: (error) => console.error(error)
 * });
 * ```
 */
export function configureFetchiva(config: FetchivaConfig): void {
  globalConfig = { ...config };
}

/**
 * Returns the current global configuration.
 * @returns The current FetchivaConfig object
 * @internal
 */
export function getConfig(): FetchivaConfig {
  return globalConfig;
}
