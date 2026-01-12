import {
  configureFetchiva,
  fetchiva,
  get,
  post,
  put,
  patch,
  del,
  isHttpError,
  isNetworkError,
  isTimeoutError,
  isFetchivaError,
} from "fetchiva";

console.log("Fetchiva Playground");
console.log("=".repeat(50));

// ============================================
// Global Configuration
// ============================================

configureFetchiva({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  retry: {
    retries: 2,
    retryDelay: 500,
  },
  onRequest: (ctx) => {
    console.log(`  [Hook] onRequest: ${ctx.options.method ?? "GET"} ${ctx.url}`);
    return ctx;
  },
  onResponse: (res) => {
    console.log(`  [Hook] onResponse: ${res.status} ${res.statusText}`);
    return res;
  },
  onError: (err) => {
    console.log(`  [Hook] onError: ${err.message}`);
  },
});

// ============================================
// HTTP Method Examples
// ============================================

async function runHttpMethodExamples() {
  console.log("\n[ HTTP Method Examples ]");
  console.log("-".repeat(50));

  // GET
  console.log("\n1. GET /posts/1");
  const getRes = await get<{ id: number; title: string }>("/posts/1");
  console.log(`   Status: ${getRes.status}`);
  console.log(`   Title: ${getRes.data.title.slice(0, 40)}...`);

  // POST
  console.log("\n2. POST /posts");
  const postRes = await post<{ id: number }>(
    "/posts",
    JSON.stringify({ title: "New Post", body: "Content", userId: 1 })
  );
  console.log(`   Status: ${postRes.status}`);
  console.log(`   Created ID: ${postRes.data.id}`);

  // PUT
  console.log("\n3. PUT /posts/1");
  const putRes = await put<{ id: number }>(
    "/posts/1",
    JSON.stringify({ id: 1, title: "Updated", body: "Updated content", userId: 1 })
  );
  console.log(`   Status: ${putRes.status}`);

  // PATCH
  console.log("\n4. PATCH /posts/1");
  const patchRes = await patch<{ id: number }>(
    "/posts/1",
    JSON.stringify({ title: "Patched Title" })
  );
  console.log(`   Status: ${patchRes.status}`);

  // DELETE
  console.log("\n5. DELETE /posts/1");
  const delRes = await del("/posts/1");
  console.log(`   Status: ${delRes.status}`);
  console.log(`   OK: ${delRes.ok}`);
}

// ============================================
// Request Override Examples
// ============================================

async function runOverrideExamples() {
  console.log("\n[ Request Override Examples ]");
  console.log("-".repeat(50));

  // Override baseURL
  console.log("\n1. Override baseURL per-request");
  const res1 = await fetchiva("/posts/2", {
    baseURL: "https://jsonplaceholder.typicode.com",
  });
  console.log(`   Status: ${res1.status}`);

  // Override headers
  console.log("\n2. Override headers per-request");
  const res2 = await fetchiva("/posts/3", {
    headers: { "X-Custom-Header": "custom-value" },
  });
  console.log(`   Status: ${res2.status}`);

  // Override timeout
  console.log("\n3. Override timeout per-request");
  const res3 = await fetchiva("/posts/4", { timeout: 10000 });
  console.log(`   Status: ${res3.status}`);
}

// ============================================
// Error Handling Examples
// ============================================

async function runErrorExamples() {
  console.log("\n[ Error Handling Examples ]");
  console.log("-".repeat(50));

  // HTTP Error (404)
  console.log("\n1. HTTP Error (404 Not Found)");
  try {
    await fetchiva("/posts/99999");
  } catch (error) {
    if (isHttpError(error)) {
      console.log(`   Caught HttpError: ${error.status} ${error.statusText}`);
      console.log(`   URL: ${error.url}`);
    }
  }

  // Type guard demonstration
  console.log("\n2. Type Guard Demonstration");
  try {
    await fetchiva("/posts/99999");
  } catch (error) {
    if (isFetchivaError(error)) {
      console.log(`   Error type: ${error.type}`);
      console.log(`   Is HTTP error: ${isHttpError(error)}`);
      console.log(`   Is Network error: ${isNetworkError(error)}`);
      console.log(`   Is Timeout error: ${isTimeoutError(error)}`);
    }
  }
}

// ============================================
// Main
// ============================================

async function main() {
  try {
    await runHttpMethodExamples();
    await runOverrideExamples();
    await runErrorExamples();

    console.log("\n" + "=".repeat(50));
    console.log("All examples completed successfully!");
  } catch (error) {
    console.error("\nUnexpected error:", error);
    process.exit(1);
  }
}

main();
