import { configureFetchiva, fetchiva, get, post, put, patch, del } from "fetchiva";

console.log("Fetchiva Node Playground");
console.log("---");

// Configure fetchiva once at app startup
configureFetchiva({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Test 1: Basic GET request (uses global config)
async function testBasicGet() {
  console.log("Test 1: Basic GET /posts/1");
  const response = await fetchiva<{ id: number; title: string }>("/posts/1");
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.log("---");
}

// Test 2: Override baseURL for this request only
async function testOverrideBaseURL() {
  console.log("Test 2: Override baseURL");
  const response = await fetchiva("/posts/1", {
    baseURL: "https://jsonplaceholder.typicode.com",
  });
  console.log("Data:", response.data);
  console.log("Status:", response.status);
  console.log("---");
}

// Test 3: Override headers for this request only
async function testOverrideHeaders() {
  console.log("Test 3: Override headers");
  const response = await fetchiva("/posts/1", {
    headers: {
      "X-Custom-Header": "custom-value",
    },
  });
  console.log("Data:", response.data);
  console.log("Status:", response.status);
  console.log("---");
}

// Test 4: GET helper
async function testGetHelper() {
  console.log("Test 4: GET helper");
  const response = await get<{ id: number; title: string }>("/posts/1");
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.log("---");
}

// Test 5: POST helper
async function testPostHelper() {
  console.log("Test 5: POST helper");
  const response = await post<{ id: number; title: string }>(
    "/posts",
    JSON.stringify({ title: "New Post", body: "Content", userId: 1 })
  );
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.log("---");
}

// Test 6: PUT helper
async function testPutHelper() {
  console.log("Test 6: PUT helper");
  const response = await put<{ id: number; title: string }>(
    "/posts/1",
    JSON.stringify({ id: 1, title: "Updated Post", body: "Updated", userId: 1 })
  );
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.log("---");
}

// Test 7: PATCH helper
async function testPatchHelper() {
  console.log("Test 7: PATCH helper");
  const response = await patch<{ id: number; title: string }>(
    "/posts/1",
    JSON.stringify({ title: "Patched Title" })
  );
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.log("---");
}

// Test 8: DELETE helper
async function testDeleteHelper() {
  console.log("Test 8: DELETE helper");
  const response = await del("/posts/1");
  console.log("Status:", response.status);
  console.log("OK:", response.ok);
  console.log("---");
}

// Run all tests
async function main() {
  try {
    await testBasicGet();
    await testOverrideBaseURL();
    await testOverrideHeaders();
    await testGetHelper();
    await testPostHelper();
    await testPutHelper();
    await testPatchHelper();
    await testDeleteHelper();
    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();
