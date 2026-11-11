import { Router } from "express";
import { submitScore, getMyBestScores, getLeaderboard } from "../controllers/gamesController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateScoreSubmission } from "../middleware/validate.js";

const router = Router();

// Route 1: Naya score submit karna (Auth required + Validation)
router.post("/scores", requireAuth, validateScoreSubmission, submitScore);

// Route 2: Current user ka best score har game ke liye (Auth required)
router.get("/my-best", requireAuth, getMyBestScores);

// Route 3: Public leaderboard (Top 10 players for a game)
router.get("/leaderboard/:game", getLeaderboard);

export default router;
