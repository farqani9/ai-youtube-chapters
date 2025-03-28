import express from "express";
import { generateChapters } from "../services/openai.js";

export const router = express.Router();

router.post("/generate", async (req, res, next) => {
  try {
    const videoData = req.body;

    // Validate request body
    if (!videoData.title || !videoData.duration) {
      return res.status(400).json({
        error: "Missing required fields: title and duration are required",
      });
    }

    if (!videoData.transcript && !videoData.description) {
      return res.status(400).json({
        error: "Either transcript or description must be provided",
      });
    }

    // Generate chapters
    const chapters = await generateChapters(videoData);

    // Return generated chapters
    res.json({
      success: true,
      data: {
        chapters,
        videoId: videoData.videoId,
      },
    });
  } catch (error) {
    next(error);
  }
});
