import jwt from "jsonwebtoken";

export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  try {
    // Verify the API key is valid
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};
