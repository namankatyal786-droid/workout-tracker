import prisma from "../lib/prisma.js";

// 1. POST /api/games/scores
// Naya mini game score save karna (Authenticated User ke liye)
// Viva point: INSERT query chalti hai jo foreign key userId se User table ko link karti hai.
export async function submitScore(req, res) {
  try {
    const { game, score } = req.body;
    const userId = req.user.id;

    const newScoreRecord = await prisma.miniGameScore.create({
      data: {
        userId,
        game,
        score
      }
    });

    return res.status(201).json({
      success: true,
      message: "Score submitted successfully!",
      data: newScoreRecord
    });
  } catch (error) {
    console.error("[SubmitScore Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to record mini game score."
    });
  }
}

// 2. GET /api/games/my-best
// Logged-in user ke har game ke highest (best) scores fetch karna
// Viva point: GROUP BY game ke saath MAX(score) aggregate function use hota hai.
export async function getMyBestScores(req, res) {
  try {
    const userId = req.user.id;

    // Aggregate query via Prisma ORM
    const grouped = await prisma.miniGameScore.groupBy({
      by: ["game"],
      where: {
        userId: userId
      },
      _max: {
        score: true
      }
    });

    // Clean JSON response mapping: { "bag-catcher": 150, "whack-a-mole": 340 }
    const bestScores = {};
    for (const item of grouped) {
      bestScores[item.game] = item._max.score || 0;
    }

    return res.status(200).json({
      success: true,
      data: bestScores
    });
  } catch (error) {
    console.error("[GetMyBestScores Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user's best scores."
    });
  }
}

// 3. GET /api/games/leaderboard/:game
// Top 10 players across the app (username + best score, descending)
// Viva point: Relational DBMS query with INNER JOIN (User + MiniGameScore), GROUP BY u.id, u.name,
// MAX(score), ORDER BY bestScore DESC, LIMIT 10.
export async function getLeaderboard(req, res) {
  try {
    const { game } = req.params;

    if (!["bag-catcher", "whack-a-mole"].includes(game)) {
      return res.status(400).json({
        success: false,
        error: `Invalid game identifier '${game}'. Choose 'bag-catcher' or 'whack-a-mole'.`
      });
    }

    // Parameterized SQL query through Prisma to prevent SQL Injection
    const rawLeaderboard = await prisma.$queryRaw`
      SELECT 
        u.name AS "username", 
        MAX(s.score) AS "bestScore"
      FROM "MiniGameScore" s
      JOIN "User" u ON s."userId" = u.id
      WHERE s.game = ${game}
      GROUP BY u.id, u.name
      ORDER BY "bestScore" DESC
      LIMIT 10;
    `;

    // Convert potential BigInt values to standard Numbers
    const leaderboard = rawLeaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      bestScore: Number(entry.bestScore)
    }));

    return res.status(200).json({
      success: true,
      game,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error("[GetLeaderboard Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch leaderboard data."
    });
  }
}
