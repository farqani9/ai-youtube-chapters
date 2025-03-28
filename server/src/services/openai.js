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

    const systemPrompt = `You are an expert YouTube content analyzer and chapter generator. Your primary goal is to create highly accurate, contextually relevant chapters that precisely reflect the video's content structure.

KEY RESPONSIBILITIES:
1. Carefully analyze the content to identify genuine topic changes and key moments
2. Create chapters only at clear content transitions or significant topic changes
3. Ensure chapter titles directly reflect the actual content being discussed
4. Maintain natural pacing - chapters should follow the video's logical structure

CONTENT ANALYSIS GUIDELINES:
- For transcripts: Focus on speaker topic changes, new concept introductions, and clear transition phrases
- For descriptions: Identify main topics, listed sections, and content structure markers
- Look for transitional phrases like "moving on to", "next, let's discuss", "now we'll cover"
- Pay attention to numerical markers, section numbers, or clear topic shifts
- Identify tutorial steps, distinct examples, or demonstration segments

CHAPTER CREATION RULES:
1. Every chapter must correspond to actual content transitions
2. Avoid arbitrary time-based splits - only create chapters at genuine topic changes
3. Chapter titles must use words/phrases from the actual content
4. Ensure chronological flow matches the content progression
5. No placeholder or generic titles - be specific to the content`;

    // Construct the user prompt
    const userPrompt = `ANALYZE AND GENERATE CHAPTERS FOR:

METADATA:
Title: ${title}
Duration: ${Math.floor(duration / 60)} minutes and ${duration % 60} seconds
Content Source: ${transcript ? "Full Video Transcript" : "Video Description"}

${transcript ? "TRANSCRIPT:\n" + transcript : "DESCRIPTION:\n" + description}

CHAPTER GENERATION REQUIREMENTS:
1. Format: Strictly use "MM:SS - Chapter Title"
2. First Chapter: Must be "00:00 - [Relevant Introduction Title]"
3. Duration Limit: Final timestamp before ${Math.floor(duration / 60)}:${String(
      duration % 60
    ).padStart(2, "0")}
4. Chapter Count: ${
      duration > 1200 ? "6-8" : "3-5"
    } chapters (based on ${Math.floor(duration / 60)} minute duration)
5. Title Style: 
   - Use 2-6 words
   - Include specific terms from content
   - Be descriptive and meaningful
   - Avoid generic words like "Part 1", "Section", etc.
6. Distribution:
   - Space chapters based on actual content transitions
   - Minimum 60 seconds between chapters
   - Ensure logical progression
7. Language:
   - Use professional, clear terminology
   - Match the content's technical level
   - Be consistent with video's style

EXAMPLE OUTPUT (DO NOT USE THESE TITLES, GENERATE BASED ON ACTUAL CONTENT):
00:00 - Project Setup and Requirements
02:30 - Database Schema Design
05:45 - API Implementation Steps
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
      temperature: 0.3, // Reduced further for more deterministic output
      max_tokens: 500,
      presence_penalty: 0.2, // Adjusted for better context adherence
      frequency_penalty: 0.4, // Increased to reduce repetitive language
      top_p: 0.9, // Added to focus on more probable completions
    });

    // Parse the response into structured chapter data
    const chaptersText = completion.choices[0].message.content;
    const chapters = parseChapters(chaptersText, duration);

    // Enhanced validation
    validateChapterDistribution(chapters, duration);
    validateChapterTitles(chapters);

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

function validateChapterTitles(chapters) {
  const genericTerms = [
    "part",
    "section",
    "chapter",
    "segment",
    "portion",
    "continued",
    "misc",
    "miscellaneous",
    "other",
    "etc",
  ];

  chapters.forEach((chapter) => {
    // Check for minimum word count
    const wordCount = chapter.title.split(" ").length;
    if (wordCount < 2 || wordCount > 6) {
      throw new Error(
        `Chapter title "${chapter.title}" should be 2-6 words (currently ${wordCount} words)`
      );
    }

    // Check for generic terms
    const lowerTitle = chapter.title.toLowerCase();
    const foundGenericTerm = genericTerms.find(
      (term) =>
        lowerTitle.includes(term) &&
        // Allow terms if they're part of a specific phrase
        !lowerTitle.includes(`${term} design`) &&
        !lowerTitle.includes(`${term} implementation`) &&
        !lowerTitle.includes(`${term} analysis`)
    );

    if (foundGenericTerm) {
      throw new Error(
        `Chapter title "${chapter.title}" contains generic term "${foundGenericTerm}". Please use more specific descriptions.`
      );
    }
  });
}
