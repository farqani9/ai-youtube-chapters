const API_URL = "http://localhost:3000";
const API_KEY = "test-key-123";

// Function to check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/test`, {
      headers: {
        "X-API-Key": API_KEY,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Server check failed:", error);
    return false;
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateChapters") {
    // Get the active tab ID first
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]?.id) {
        sendResponse({ error: "No active tab found" });
        return;
      }

      try {
        // Check if server is running
        const isServerRunning = await checkServer();
        if (!isServerRunning) {
          throw new Error(
            "Server is not running. Please start the server with 'npm run dev' in the server directory."
          );
        }

        const result = await handleChapterGeneration(tabs[0].id);
        sendResponse(result);
      } catch (error) {
        console.error("Error in chapter generation:", error);
        sendResponse({ error: error.message || "Failed to generate chapters" });
      }
    });
    return true; // Will respond asynchronously
  }
});

async function handleChapterGeneration(tabId) {
  try {
    // First, inject the content script if it hasn't been injected
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });

    // Then extract video data
    const [{ result: videoData }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          return await window.extractVideoData();
        } catch (error) {
          console.error("Error in extractVideoData:", error);
          return null;
        }
      },
    });

    if (!videoData) {
      throw new Error("Failed to extract video data");
    }

    console.log("Sending video data to server:", videoData);

    // Send data to our server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${API_URL}/api/chapters/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify(videoData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to generate chapters");
      }

      // Check if chapters exist in the response
      if (!responseData.chapters && !responseData.data?.chapters) {
        throw new Error("No chapters received from server");
      }

      const chapters = responseData.chapters || responseData.data.chapters;

      // Inject chapters into the page
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (chaptersData) => window.injectChapters(chaptersData),
        args: [chapters],
      });

      return { success: true };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Server request timed out. Please try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Chapter generation failed:", error);
    throw error;
  }
}
