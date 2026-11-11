// Allowed game slugs for validation
const ALLOWED_GAMES = ["bag-catcher", "whack-a-mole"];
const MAX_SCORE_SANITY_CAP = 1000000; // 10 Lakh score cap taaki cheats ya corrupt payloads reject hon

// validateScoreSubmission: POST /api/games/scores ke payload ko check karta hai
// Viva point: Input validation hamesha backend par zaroori hai (client-side validation can be bypassed).
export function validateScoreSubmission(req, res, next) {
  const { game, score } = req.body;

  // 1. Validate 'game'
  if (!game || typeof game !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'game' is required and must be a string."
    });
  }

  if (!ALLOWED_GAMES.includes(game)) {
    return res.status(400).json({
      success: false,
      error: `Validation failed: Invalid game '${game}'. Allowed values are: ${ALLOWED_GAMES.join(", ")}`
    });
  }

  // 2. Validate 'score' (must be integer, non-negative, and under sanity cap)
  if (score === undefined || score === null) {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'score' is required."
    });
  }

  if (!Number.isInteger(score)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'score' must be an integer."
    });
  }

  if (score < 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'score' must be a non-negative integer (>= 0)."
    });
  }

  if (score > MAX_SCORE_SANITY_CAP) {
    return res.status(400).json({
      success: false,
      error: `Validation failed: 'score' exceeds maximum allowable sanity limit (${MAX_SCORE_SANITY_CAP}).`
    });
  }

  next();
}
