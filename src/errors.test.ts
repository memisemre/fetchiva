import { describe, it, expect } from "vitest";
import {
  FetchivaError,
  NetworkError,
  TimeoutError,
  HttpError,
  isNetworkError,
  isTimeoutError,
  isHttpError,
  isFetchivaError,
} from "./errors";

describe("FetchivaError", () => {
  it("should create error with type and message", () => {
    const error = new FetchivaError("network", "Test error");
    expect(error.message).toBe("Test error");
    expect(error.type).toBe("network");
    expect(error.name).toBe("FetchivaError");
  });

  it("should include url and method when provided", () => {
    const error = new FetchivaError("http", "Test error", {
      url: "https://api.example.com",
      method: "POST",
    });
    expect(error.url).toBe("https://api.example.com");
    expect(error.method).toBe("POST");
  });

  it("should include cause when provided", () => {
    const cause = new Error("Original error");
    const error = new FetchivaError("network", "Wrapped error", { cause });
    expect(error.cause).toBe(cause);
  });

  it("should be instanceof Error", () => {
    const error = new FetchivaError("network", "Test error");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("NetworkError", () => {
  it("should create network error with correct type", () => {
    const error = new NetworkError("Network failed");
    expect(error.message).toBe("Network failed");
    expect(error.type).toBe("network");
    expect(error.name).toBe("NetworkError");
  });

  it("should be instanceof FetchivaError", () => {
    const error = new NetworkError("Network failed");
    expect(error).toBeInstanceOf(FetchivaError);
  });

  it("should include options when provided", () => {
    const error = new NetworkError("Network failed", {
      url: "https://api.example.com",
      method: "GET",
    });
    expect(error.url).toBe("https://api.example.com");
    expect(error.method).toBe("GET");
  });
});

describe("TimeoutError", () => {
  it("should create timeout error with correct type", () => {
    const error = new TimeoutError("Request timed out");
    expect(error.message).toBe("Request timed out");
    expect(error.type).toBe("timeout");
    expect(error.name).toBe("TimeoutError");
  });

  it("should be instanceof FetchivaError", () => {
    const error = new TimeoutError("Request timed out");
    expect(error).toBeInstanceOf(FetchivaError);
  });
});

describe("HttpError", () => {
  it("should create HTTP error with status info", () => {
    const error = new HttpError("Not found", {
      status: 404,
      statusText: "Not Found",
    });
    expect(error.message).toBe("Not found");
    expect(error.type).toBe("http");
    expect(error.name).toBe("HttpError");
    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
  });

  it("should be instanceof FetchivaError", () => {
    const error = new HttpError("Server error", {
      status: 500,
      statusText: "Internal Server Error",
    });
    expect(error).toBeInstanceOf(FetchivaError);
  });

  it("should include url and method when provided", () => {
    const error = new HttpError("Bad request", {
      status: 400,
      statusText: "Bad Request",
      url: "https://api.example.com/users",
      method: "POST",
    });
    expect(error.url).toBe("https://api.example.com/users");
    expect(error.method).toBe("POST");
  });
});

describe("Type guards", () => {
  describe("isNetworkError", () => {
    it("should return true for NetworkError", () => {
      const error = new NetworkError("Network failed");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isNetworkError(new TimeoutError("Timeout"))).toBe(false);
      expect(isNetworkError(new Error("Generic error"))).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe("isTimeoutError", () => {
    it("should return true for TimeoutError", () => {
      const error = new TimeoutError("Timeout");
      expect(isTimeoutError(error)).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isTimeoutError(new NetworkError("Network"))).toBe(false);
      expect(isTimeoutError(new Error("Generic error"))).toBe(false);
    });
  });

  describe("isHttpError", () => {
    it("should return true for HttpError", () => {
      const error = new HttpError("HTTP error", {
        status: 404,
        statusText: "Not Found",
      });
      expect(isHttpError(error)).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isHttpError(new NetworkError("Network"))).toBe(false);
      expect(isHttpError(new Error("Generic error"))).toBe(false);
    });
  });

  describe("isFetchivaError", () => {
    it("should return true for all Fetchiva error types", () => {
      expect(isFetchivaError(new FetchivaError("network", "error"))).toBe(true);
      expect(isFetchivaError(new NetworkError("error"))).toBe(true);
      expect(isFetchivaError(new TimeoutError("error"))).toBe(true);
      expect(
        isFetchivaError(
          new HttpError("error", { status: 500, statusText: "Error" })
        )
      ).toBe(true);
    });

    it("should return false for non-Fetchiva errors", () => {
      expect(isFetchivaError(new Error("Generic error"))).toBe(false);
      expect(isFetchivaError("string")).toBe(false);
      expect(isFetchivaError(123)).toBe(false);
      expect(isFetchivaError(null)).toBe(false);
    });
  });
});
