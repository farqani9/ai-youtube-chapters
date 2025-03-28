import fetch from "node-fetch";

const API_URL = "http://localhost:3000";
const API_KEY = "test-key-123";

async function testServer() {
  try {
    // Test basic server connection
    console.log("1. Testing server connection...");
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    console.log("Server response:", data);
    console.log("✅ Server is running\n");

    // Test chapter generation
    console.log("2. Testing chapter generation...");
    const chapterResponse = await fetch(`${API_URL}/api/chapters/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        title: "Learn Node.js in 1 Hour",
        duration: 3600,
        description:
          "Complete Node.js tutorial covering: 1. Introduction to Node.js 2. Setting up your environment 3. Creating a basic server 4. Working with npm packages 5. Building a REST API 6. Database integration 7. Deployment tips",
      }),
    });

    const chapterData = await chapterResponse.json();
    console.log("Generated chapters:", JSON.stringify(chapterData, null, 2));
    console.log("✅ Chapter generation successful");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the tests
testServer();
