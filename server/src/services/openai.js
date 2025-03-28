import OpenAI from "openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Validate OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.replace(/['"]/g, ""); // Remove any quotes
if (!OPENAI_API_KEY) {
  throw new Error(
    "OpenAI API key is required. Please set OPENAI_API_KEY in your .env file."
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateChapters(videoData) {
  try {
    const { transcript, title, description, duration } = videoData;

    // Construct the prompt
    const prompt = `Generate chapters for a YouTube video with the following details:
Title: ${title}
Duration: ${Math.floor(duration / 60)} minutes and ${duration % 60} seconds
${transcript ? "Transcript: " + transcript : "Description: " + description}

Please generate a list of chapters in the following format:
00:00 - Introduction
MM:SS - Chapter Title

Rules:
1. Each chapter should be meaningful and descriptive
2. Timestamps must be in chronological order
3. First chapter should start at 00:00
4. Last timestamp MUST NOT exceed the video duration of ${Math.floor(
      duration / 60
    )}:${String(duration % 60).padStart(2, "0")}
5. Include 3-8 chapters depending on video length
6. Each chapter title should be concise (2-6 words)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates accurate and meaningful chapters for YouTube videos. Ensure all timestamps are within the video duration.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse the response into structured chapter data
    const chaptersText = completion.choices[0].message.content;
    const chapters = parseChapters(chaptersText, duration);

    return chapters;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    error.name = "OpenAIError";
    throw error;
  }
}

function parseChapters(chaptersText, videoDuration) {
  const chapterLines = chaptersText.split("\n").filter((line) => line.trim());

  return chapterLines.map((line) => {
    const [timestamp, ...titleParts] = line.split(" - ");
    const title = titleParts.join(" - ").trim();

    // Convert timestamp to seconds
    const [minutes, seconds] = timestamp.split(":").map(Number);
    const timeInSeconds = minutes * 60 + seconds;

    // Validate timestamp doesn't exceed video duration
    if (timeInSeconds > videoDuration) {
      throw new Error(
        `Chapter timestamp ${timestamp} exceeds video duration of ${Math.floor(
          videoDuration / 60
        )}:${String(videoDuration % 60).padStart(2, "0")}`
      );
    }

    return {
      title,
      timestamp,
      timeInSeconds,
    };
  });
}
