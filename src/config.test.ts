import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureFetchiva, getConfig } from "./config";

describe("config", () => {
  beforeEach(() => {
    configureFetchiva({});
  });

  describe("configureFetchiva", () => {
    it("should set baseURL", () => {
      configureFetchiva({ baseURL: "https://api.example.com" });
      expect(getConfig().baseURL).toBe("https://api.example.com");
    });

    it("should set headers", () => {
      configureFetchiva({
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
      });
      expect(getConfig().headers).toEqual({
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      });
    });

    it("should set timeout", () => {
      configureFetchiva({ timeout: 5000 });
      expect(getConfig().timeout).toBe(5000);
    });

    it("should set retry config", () => {
      configureFetchiva({
        retry: {
          retries: 3,
          retryDelay: 1000,
        },
      });
      expect(getConfig().retry).toEqual({
        retries: 3,
        retryDelay: 1000,
      });
    });

    it("should set lifecycle hooks", () => {
      const onRequest = vi.fn();
      const onResponse = vi.fn();
      const onError = vi.fn();

      configureFetchiva({ onRequest, onResponse, onError });

      expect(getConfig().onRequest).toBe(onRequest);
      expect(getConfig().onResponse).toBe(onResponse);
      expect(getConfig().onError).toBe(onError);
    });

    it("should replace previous config entirely", () => {
      configureFetchiva({
        baseURL: "https://api.example.com",
        timeout: 5000,
      });

      configureFetchiva({
        baseURL: "https://new-api.example.com",
      });

      expect(getConfig().baseURL).toBe("https://new-api.example.com");
      expect(getConfig().timeout).toBeUndefined();
    });
  });

  describe("getConfig", () => {
    it("should return empty object by default", () => {
      expect(getConfig()).toEqual({});
    });

    it("should return current config", () => {
      const config = {
        baseURL: "https://api.example.com",
        timeout: 3000,
        headers: { "X-Custom": "value" },
      };
      configureFetchiva(config);
      expect(getConfig()).toEqual(config);
    });
  });
});
