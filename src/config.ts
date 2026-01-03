import type { FetchivaConfig } from "./types";

let globalConfig: FetchivaConfig = {};

export function configureFetchiva(config: FetchivaConfig): void {
  globalConfig = { ...config };
}

export function getConfig(): FetchivaConfig {
  return globalConfig;
}
