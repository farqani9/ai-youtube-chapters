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

    const systemPrompt = `You are an expert YouTube content analyzer specializing in creating accurate, meaningful chapter timestamps. Your task is to:
1. Analyze video content and identify distinct topic transitions
2. Create clear, descriptive chapter titles that reflect the content
3. Ensure timestamps are precise and chronological
4. Maintain consistent chapter length distribution
5. Use professional, clear language for titles
6. Focus on key content transitions and main topics
7. Ensure chapters cover the entire video content without gaps`;

    // Construct the user prompt
    const userPrompt = `Generate chapters for this YouTube video:

METADATA:
Title: ${title}
Duration: ${Math.floor(duration / 60)} minutes and ${duration % 60} seconds
Content: ${transcript ? "Video has transcript" : "Using video description"}

${transcript ? "TRANSCRIPT:\n" + transcript : "DESCRIPTION:\n" + description}

REQUIREMENTS:
1. Format: "MM:SS - Chapter Title"
2. Start with "00:00 - Introduction" or similar opening chapter
3. Last timestamp must be before ${Math.floor(duration / 60)}:${String(
      duration % 60
    ).padStart(2, "0")}
4. Generate ${duration > 1200 ? "6-8" : "3-5"} chapters (based on video length)
5. Keep titles concise (2-6 words) but descriptive
6. Ensure even distribution of chapters across the video duration
7. Use professional, objective language
8. Focus on major topic transitions

Example output format:
00:00 - Introduction
02:30 - Key Concept Overview
05:45 - Practical Implementation
...`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.5, // Reduced for more consistent output
      max_tokens: 500,
      presence_penalty: 0.3, // Encourage some content variation
      frequency_penalty: 0.3, // Discourage repetitive language
    });

    // Parse the response into structured chapter data
    const chaptersText = completion.choices[0].message.content;
    const chapters = parseChapters(chaptersText, duration);

    // Validate chapter distribution
    validateChapterDistribution(chapters, duration);

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

function validateChapterDistribution(chapters, totalDuration) {
  // Ensure chapters are reasonably distributed
  const minChapterLength = 60; // Minimum 1 minute per chapter
  const avgChapterLength = totalDuration / chapters.length;

  for (let i = 0; i < chapters.length - 1; i++) {
    const chapterDuration =
      chapters[i + 1].timeInSeconds - chapters[i].timeInSeconds;

    if (chapterDuration < minChapterLength) {
      throw new Error(
        `Chapter "${chapters[i].title}" is too short (${chapterDuration} seconds). Minimum length is ${minChapterLength} seconds.`
      );
    }

    // Check for very uneven chapter lengths (3x average)
    if (chapterDuration > avgChapterLength * 3) {
      throw new Error(
        `Chapter "${chapters[i].title}" is too long (${chapterDuration} seconds). Consider breaking it into smaller chapters.`
      );
    }
  }
}
