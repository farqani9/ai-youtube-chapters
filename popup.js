document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error");
  const statusText = document.querySelector(".status");

  let isGenerating = false;

  // Check if current tab is a YouTube video
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    // Updated regex to handle more URL variations
    const isYouTubeVideo = currentTab.url.match(
      /(?:m\.|www\.)?youtube\.com\/watch.*[?&]v=/
    );

    if (!isYouTubeVideo) {
      generateBtn.disabled = true;
      statusText.textContent = "Please navigate to a YouTube video";
      errorDiv.textContent = "This extension only works on YouTube video pages";
      errorDiv.style.display = "block";
      return;
    }

    // Enable button if we're on a valid YouTube video page
    generateBtn.disabled = false;
    errorDiv.style.display = "none";
    statusText.textContent = "Generate AI-powered chapters for this video";
  });

  generateBtn.addEventListener("click", async () => {
    if (isGenerating) return;

    try {
      isGenerating = true;
      generateBtn.disabled = true;
      errorDiv.style.display = "none";
      loadingDiv.style.display = "flex";
      statusText.textContent = "Analyzing video content...";

      // Send message to background script to start chapter generation
      const response = await chrome.runtime.sendMessage({
        action: "generateChapters",
      });

      if (response.error) {
        throw new Error(response.error);
      }

      statusText.textContent = "Chapters generated successfully!";
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error) {
      errorDiv.textContent = error.message || "Failed to generate chapters";
      errorDiv.style.display = "block";
      statusText.textContent = "Generate AI-powered chapters for this video";
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      loadingDiv.style.display = "none";
    }
  });
});
