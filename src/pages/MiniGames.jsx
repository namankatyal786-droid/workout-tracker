import { useState, useEffect } from "react";
import { getMyBestScores } from "../utils/api";
import "../styles/Games.css";

// MiniGames Page: Dono games ke cards list karta hai aur player ka best score dikhata hai
// Viva point: React useEffect hook se component mount hone par backend se highest scores fetch hote hain.
export default function MiniGames({ onSelectGame }) {
  const [bestScores, setBestScores] = useState({
    "bag-catcher": 0,
    "whack-a-mole": 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadScores() {
      try {
        const scores = await getMyBestScores();
        setBestScores(scores);
      } catch (err) {
        console.warn("Best scores load nahi ho paye, default 0 use kar rahe hain.", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadScores();
  }, []);

  const games = [
    {
      slug: "bag-catcher",
      title: "Gym Bag Catcher",
      icon: "🎒",
      category: "Reflex & Nutrition",
      description:
        "Slide your gym bag to catch healthy protein, water, and dumbells. Avoid greasy burgers and pizzas! 3 lives total.",
      bestScore: bestScores["bag-catcher"] || 0
    },
    {
      slug: "whack-a-mole",
      title: "Whack-a-Mole: Gym Edition",
      icon: "🔨",
      category: "Speed & Accuracy",
      description:
        "3x3 gym grid challenge! Tap healthy items to build your combo multiplier. Hit junk food and lose points and 3 seconds!",
      bestScore: bestScores["whack-a-mole"] || 0
    }
  ];

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Mini Games</h1>
        <p>Test your gym reflexes, maintain healthy nutrition habits, and climb the leaderboard!</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div key={game.slug} className="game-card">
            <div className="game-card-icon">{game.icon}</div>
            <h3>{game.title}</h3>
            <p>{game.description}</p>

            <div className="game-card-stats">
              <span>Personal Best</span>
              <strong>{isLoading ? "..." : `${game.bestScore} pts`}</strong>
            </div>

            <button
              className="btn-play-game"
              onClick={() => onSelectGame(game.slug)}
            >
              <span>Play Game</span>
              <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
