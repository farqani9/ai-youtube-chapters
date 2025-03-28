// Expose the extraction function to be called from background script
window.extractVideoData = async function () {
  try {
    const video = document.querySelector("video");
    if (!video) {
      throw new Error("Video element not found");
    }

    // Get video metadata
    const videoData = {
      title: document.title.replace(" - YouTube", ""),
      duration: Math.floor(video.duration),
      currentTime: Math.floor(video.currentTime),
      videoId: new URLSearchParams(window.location.search).get("v"),
    };

    // Try to get transcript
    const transcriptButton = Array.from(
      document.querySelectorAll("button")
    ).find((button) =>
      button.textContent.toLowerCase().includes("show transcript")
    );

    if (transcriptButton) {
      videoData.hasTranscript = true;
      // Click transcript button to get content
      transcriptButton.click();

      // Wait for transcript to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const transcriptText = document
        .querySelector("#transcript-scrollbox")
        ?.textContent?.trim();

      if (transcriptText) {
        videoData.transcript = transcriptText;
      }

      // Close transcript panel
      transcriptButton.click();
    }

    // Get video description
    const description = document.querySelector("#description-inner");
    if (description) {
      videoData.description = description.textContent.trim();
    }

    console.log("Extracted video data:", videoData);
    return videoData;
  } catch (error) {
    console.error("Error extracting video data:", error);
    throw error;
  }
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoData") {
    const videoData = window.extractVideoData();
    sendResponse(videoData);
    return true;
  }
});

// Function to inject chapters into the YouTube page
window.injectChapters = function (chapters) {
  try {
    // Create chapters container
    const chaptersContainer = document.createElement("div");
    chaptersContainer.className = "ai-generated-chapters";
    chaptersContainer.style.cssText = `
      margin: 16px 0;
      padding: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: var(--yt-spec-base-background);
    `;

    // Add title
    const title = document.createElement("h2");
    title.textContent = "AI-Generated Chapters";
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 16px;
      color: var(--yt-spec-text-primary);
    `;
    chaptersContainer.appendChild(title);

    // Add chapters list
    const chaptersList = document.createElement("div");
    chaptersList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    chapters.forEach((chapter) => {
      const chapterItem = document.createElement("div");
      chapterItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      `;

      chapterItem.innerHTML = `
        <span style="color: var(--yt-spec-text-secondary);">${chapter.timestamp}</span>
        <span style="color: var(--yt-spec-text-primary);">${chapter.title}</span>
      `;

      // Add hover effect
      chapterItem.addEventListener("mouseover", () => {
        chapterItem.style.backgroundColor =
          "var(--yt-spec-badge-chip-background)";
      });
      chapterItem.addEventListener("mouseout", () => {
        chapterItem.style.backgroundColor = "transparent";
      });

      // Add click handler to seek to timestamp
      chapterItem.addEventListener("click", () => {
        const video = document.querySelector("video");
        if (video) {
          video.currentTime = chapter.timeInSeconds;
        }
      });

      chaptersList.appendChild(chapterItem);
    });

    chaptersContainer.appendChild(chaptersList);

    // Insert chapters below the video description
    const descriptionSection = document.querySelector("#description-inner");
    if (descriptionSection) {
      descriptionSection.parentElement.insertBefore(
        chaptersContainer,
        descriptionSection.nextSibling
      );
    }

    return true;
  } catch (error) {
    console.error("Error injecting chapters:", error);
    return false;
  }
};
