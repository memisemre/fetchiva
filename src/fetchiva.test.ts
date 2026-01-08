import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { fetchiva, get, post, put, patch, del } from "./fetchiva";
import { configureFetchiva } from "./config";
import { HttpError, NetworkError, TimeoutError } from "./errors";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createMockResponse(
  data: unknown,
  options: { status?: number; statusText?: string; ok?: boolean } = {}
) {
  const { status = 200, statusText = "OK", ok = true } = options;
  return {
    ok,
    status,
    statusText,
    headers: new Headers(),
    json: () => Promise.resolve(data),
  };
}

describe("fetchiva", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    configureFetchiva({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic requests", () => {
    it("should make a successful GET request", async () => {
      const responseData = { id: 1, name: "Test" };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await fetchiva("/users/1");

      expect(mockFetch).toHaveBeenCalledWith("/users/1", expect.any(Object));
      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
      expect(result.ok).toBe(true);
    });

    it("should merge headers from config and request", async () => {
      configureFetchiva({
        headers: { Authorization: "Bearer token" },
      });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/api", {
        headers: { "Content-Type": "application/json" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should use request headers to override global headers", async () => {
      configureFetchiva({
        headers: { Authorization: "Bearer old-token" },
      });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/api", {
        headers: { Authorization: "Bearer new-token" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api",
        expect.objectContaining({
          headers: { Authorization: "Bearer new-token" },
        })
      );
    });
  });

  describe("URL building", () => {
    it("should prepend baseURL from config", async () => {
      configureFetchiva({ baseURL: "https://api.example.com" });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    it("should use request baseURL over global baseURL", async () => {
      configureFetchiva({ baseURL: "https://api.example.com" });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/users", { baseURL: "https://other-api.example.com" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://other-api.example.com/users",
        expect.any(Object)
      );
    });

    it("should handle baseURL with trailing slash", async () => {
      configureFetchiva({ baseURL: "https://api.example.com/" });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    it("should handle path without leading slash", async () => {
      configureFetchiva({ baseURL: "https://api.example.com" });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("users");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });
  });

  describe("error handling", () => {
    it("should throw HttpError for non-ok responses", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: "Not found" },
          { status: 404, statusText: "Not Found", ok: false }
        )
      );

      await expect(fetchiva("/users/999")).rejects.toThrow(HttpError);
    });

    it("should include status info in HttpError", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: "Not found" },
          { status: 404, statusText: "Not Found", ok: false }
        )
      );

      try {
        await fetchiva("/users/999");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).status).toBe(404);
        expect((error as HttpError).statusText).toBe("Not Found");
      }
    });

    it("should throw NetworkError for network failures", async () => {
      const networkError = new TypeError("Failed to fetch");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(fetchiva("/api")).rejects.toThrow(NetworkError);
    });

    it("should throw TimeoutError when request times out", async () => {
      vi.useRealTimers();

      mockFetch.mockImplementationOnce(
        (_url: string, options: { signal?: AbortSignal }) =>
          new Promise((_, reject) => {
            const abortHandler = () => {
              const error = new Error("Aborted");
              error.name = "AbortError";
              reject(error);
            };
            if (options?.signal?.aborted) {
              abortHandler();
            } else {
              options?.signal?.addEventListener("abort", abortHandler);
            }
          })
      );

      await expect(fetchiva("/api", { timeout: 50 })).rejects.toThrow(TimeoutError);
    });
  });

  describe("retry mechanism", () => {
    it("should retry on 5xx errors", async () => {
      vi.useRealTimers();
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(
            { error: "Server error" },
            { status: 500, statusText: "Internal Server Error", ok: false }
          )
        )
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await fetchiva("/api", { retry: { retries: 1, retryDelay: 10 } });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    });

    it("should retry on network errors", async () => {
      vi.useRealTimers();
      const networkError = new TypeError("Failed to fetch");
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await fetchiva("/api", { retry: { retries: 1, retryDelay: 10 } });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    });

    it("should not retry on 4xx errors", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: "Bad request" },
          { status: 400, statusText: "Bad Request", ok: false }
        )
      );

      await expect(
        fetchiva("/api", { retry: { retries: 3 } })
      ).rejects.toThrow(HttpError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should respect max retries", async () => {
      vi.useRealTimers();
      mockFetch.mockResolvedValue(
        createMockResponse(
          { error: "Server error" },
          { status: 500, statusText: "Internal Server Error", ok: false }
        )
      );

      await expect(
        fetchiva("/api", { retry: { retries: 2, retryDelay: 10 } })
      ).rejects.toThrow(HttpError);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should use global retry config", async () => {
      vi.useRealTimers();
      configureFetchiva({ retry: { retries: 1, retryDelay: 10 } });
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(
            { error: "Server error" },
            { status: 500, statusText: "Internal Server Error", ok: false }
          )
        )
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await fetchiva("/api");

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    });
  });

  describe("lifecycle hooks", () => {
    it("should call onRequest hook before request", async () => {
      const onRequest = vi.fn((ctx) => ctx);
      configureFetchiva({ onRequest });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/api");

      expect(onRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/api",
          options: expect.any(Object),
        })
      );
    });

    it("should allow onRequest to modify request", async () => {
      const onRequest = vi.fn((ctx) => ({
        ...ctx,
        url: "/modified-url",
      }));
      configureFetchiva({ onRequest });
      mockFetch.mockResolvedValueOnce(createMockResponse({ ok: true }));

      await fetchiva("/api");

      expect(mockFetch).toHaveBeenCalledWith("/modified-url", expect.any(Object));
    });

    it("should call onResponse hook after successful response", async () => {
      const onResponse = vi.fn((res) => res);
      configureFetchiva({ onResponse });
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: "test" }));

      await fetchiva("/api");

      expect(onResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { data: "test" },
          status: 200,
          ok: true,
        })
      );
    });

    it("should allow onResponse to modify response", async () => {
      const onResponse = vi.fn((res) => ({
        ...res,
        data: { ...res.data, modified: true },
      }));
      configureFetchiva({ onResponse });
      mockFetch.mockResolvedValueOnce(createMockResponse({ original: true }));

      const result = await fetchiva("/api");

      expect(result.data).toEqual({ original: true, modified: true });
    });

    it("should call onError hook on error", async () => {
      const onError = vi.fn();
      configureFetchiva({ onError });
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: "Not found" },
          { status: 404, statusText: "Not Found", ok: false }
        )
      );

      await expect(fetchiva("/api")).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  describe("HTTP method helpers", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(createMockResponse({ ok: true }));
    });

    it("get() should make GET request", async () => {
      await get("/users");
      expect(mockFetch).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("post() should make POST request with body", async () => {
      await post("/users", JSON.stringify({ name: "Test" }));
      expect(mockFetch).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
        })
      );
    });

    it("put() should make PUT request with body", async () => {
      await put("/users/1", JSON.stringify({ name: "Updated" }));
      expect(mockFetch).toHaveBeenCalledWith(
        "/users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Updated" }),
        })
      );
    });

    it("patch() should make PATCH request with body", async () => {
      await patch("/users/1", JSON.stringify({ name: "Patched" }));
      expect(mockFetch).toHaveBeenCalledWith(
        "/users/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Patched" }),
        })
      );
    });

    it("del() should make DELETE request", async () => {
      await del("/users/1");
      expect(mockFetch).toHaveBeenCalledWith(
        "/users/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
