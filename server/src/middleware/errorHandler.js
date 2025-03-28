export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON payload",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err.name === "OpenAIError") {
    return res.status(503).json({
      error: "AI service temporarily unavailable",
    });
  }

  // Default error response
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
