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
Duration: ${duration} seconds
${transcript ? "Transcript: " + transcript : "Description: " + description}

Please generate a list of chapters in the following format:
00:00 - Introduction
MM:SS - Chapter Title

Rules:
1. Each chapter should be meaningful and descriptive
2. Timestamps must be in chronological order
3. First chapter should start at 00:00
4. Last timestamp should not exceed video duration
5. Include 3-8 chapters depending on video length
6. Each chapter title should be concise (2-6 words)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates accurate and meaningful chapters for YouTube videos.",
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
    const chapters = parseChapters(chaptersText);

    return chapters;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    error.name = "OpenAIError";
    throw error;
  }
}

function parseChapters(chaptersText) {
  const chapterLines = chaptersText.split("\n").filter((line) => line.trim());

  return chapterLines.map((line) => {
    const [timestamp, ...titleParts] = line.split(" - ");
    const title = titleParts.join(" - ").trim();

    // Convert timestamp to seconds
    const [minutes, seconds] = timestamp.split(":").map(Number);
    const timeInSeconds = minutes * 60 + seconds;

    return {
      title,
      timestamp,
      timeInSeconds,
    };
  });
}
