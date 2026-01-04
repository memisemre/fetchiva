import { configureFetchiva, fetchiva } from "fetchiva";

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

// Run all tests
async function main() {
  try {
    await testBasicGet();
    await testOverrideBaseURL();
    await testOverrideHeaders();
    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();
