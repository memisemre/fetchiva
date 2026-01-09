# Fetchiva

A modern, type-safe fetch client for JavaScript and TypeScript.

## Features

- Full TypeScript support with type inference
- Global configuration (baseURL, headers, timeout)
- Request lifecycle hooks (onRequest, onResponse, onError)
- Automatic retry mechanism for failed requests
- Custom error classes with type guards
- Convenient HTTP method shortcuts

## Installation

```bash
# npm
npm install fetchiva

# pnpm
pnpm add fetchiva

# yarn
yarn add fetchiva
```

## Requirements

- Node.js >= 18.0.0

## Usage

### Basic Usage

```typescript
import { get, post, put, patch, del } from "fetchiva";

// GET request
const { data } = await get<User[]>("/api/users");

// POST request
const { data: newUser } = await post<User>(
  "/api/users",
  JSON.stringify({ name: "John" })
);

// PUT request
await put("/api/users/1", JSON.stringify({ name: "Jane" }));

// PATCH request
await patch("/api/users/1", JSON.stringify({ name: "Jane" }));

// DELETE request
await del("/api/users/1");
```

### Global Configuration

```typescript
import { configureFetchiva } from "fetchiva";

configureFetchiva({
  baseURL: "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token",
  },
  timeout: 5000,
});
```

### Retry Configuration

Automatically retry failed requests on network errors or 5xx status codes:

```typescript
import { configureFetchiva, get } from "fetchiva";

// Global retry config
configureFetchiva({
  retry: {
    retries: 3,
    retryDelay: 1000,
  },
});

// Per-request retry config (overrides global)
const { data } = await get("/api/users", {
  retry: {
    retries: 5,
    retryDelay: 2000,
  },
});
```

### Lifecycle Hooks

```typescript
import { configureFetchiva } from "fetchiva";

configureFetchiva({
  // Modify request before sending
  onRequest: (context) => {
    console.log(`Requesting: ${context.url}`);
    return {
      ...context,
      options: {
        ...context.options,
        headers: {
          ...context.options.headers,
          "X-Request-Id": crypto.randomUUID(),
        },
      },
    };
  },

  // Transform response data
  onResponse: (response) => {
    console.log(`Response: ${response.status}`);
    return response;
  },

  // Handle errors globally
  onError: (error) => {
    console.error("Request failed:", error.message);
  },
});
```

### Using fetchiva Directly

For more control, use the `fetchiva` function:

```typescript
import { fetchiva } from "fetchiva";

const response = await fetchiva<User>("/api/users/1", {
  method: "GET",
  headers: { Accept: "application/json" },
  timeout: 3000,
});

console.log(response.data);
console.log(response.status);
console.log(response.headers);
```

### Error Handling

Fetchiva provides custom error classes for different failure scenarios:

```typescript
import {
  get,
  isHttpError,
  isNetworkError,
  isTimeoutError,
  isFetchivaError,
} from "fetchiva";

try {
  const { data } = await get("/api/users");
} catch (error) {
  if (isHttpError(error)) {
    console.log(`HTTP ${error.status}: ${error.statusText}`);
    console.log(`URL: ${error.url}`);
  }

  if (isNetworkError(error)) {
    console.log("Network error:", error.message);
  }

  if (isTimeoutError(error)) {
    console.log("Request timed out");
  }

  if (isFetchivaError(error)) {
    console.log(`Error type: ${error.type}`); // 'network' | 'timeout' | 'http'
  }
}
```

## API Reference

### `configureFetchiva(config)`

Sets global configuration for all requests.

| Option | Type | Description |
|--------|------|-------------|
| `baseURL` | `string` | Base URL prepended to all request paths |
| `headers` | `Record<string, string>` | Default headers for all requests |
| `timeout` | `number` | Request timeout in milliseconds |
| `retry` | `RetryConfig` | Retry configuration |
| `onRequest` | `OnRequestHook` | Called before each request |
| `onResponse` | `OnResponseHook` | Called after each successful response |
| `onError` | `OnErrorHook` | Called when a request fails |

### `fetchiva<T>(path, options?)`

Makes an HTTP request and returns a typed response.

### HTTP Method Shortcuts

- `get<T>(path, options?)` - GET request
- `post<T>(path, body?, options?)` - POST request
- `put<T>(path, body?, options?)` - PUT request
- `patch<T>(path, body?, options?)` - PATCH request
- `del<T>(path, options?)` - DELETE request

### Response Type

```typescript
interface FetchivaResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}
```

### Error Classes

- `FetchivaError` - Base error class
- `HttpError` - HTTP errors (4xx, 5xx)
- `NetworkError` - Network failures
- `TimeoutError` - Request timeouts

## License

MIT
