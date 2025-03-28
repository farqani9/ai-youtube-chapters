import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { router as chaptersRouter } from "./routes/chapters.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { validateApiKey } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// More permissive CORS for testing
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"], // Added GET for easier testing
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Logging
app.use(morgan("dev")); // Changed to 'dev' for cleaner logs

// Body parsing
app.use(express.json({ limit: "1mb" }));

// API key validation for all routes
app.use(validateApiKey);

// Routes
app.use("/api/chapters", chaptersRouter);

// Add a simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API with:
  curl -X POST http://localhost:${PORT}/api/chapters/generate \\
    -H "Content-Type: application/json" \\
    -H "X-API-Key: test-key-123" \\
    -d '{
      "title": "Sample Video",
      "duration": 600,
      "description": "This is a test video about Node.js programming."
    }'`);
});
