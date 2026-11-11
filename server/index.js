import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gamesRouter from "./routes/games.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Workout Tracker Backend",
    timestamp: new Date().toISOString()
  });
});

// Register the games router with a single line:
app.use("/api/games", gamesRouter);

export default app;

// Server start if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Workout Tracker API Server running on http://localhost:${PORT}`);
  });
}
