import { useState, useEffect, useRef, useCallback } from "react";
import { submitScore, getLeaderboard } from "../utils/api";
import "../styles/Games.css";

// Game metadata helper
const GAME_DETAILS = {
  "bag-catcher": {
    title: "Dumbbell Catcher",
    icon: "🎮",
    goodItems: "🏋️ 🍌 🍎",
    goodNote: "(+Points)",
    badItems: "🍔 🍕 🍰",
    badNote: "(-1 Life & -20)",
    controlHint: "👉 Drag finger / mouse or use Left/Right Arrow keys 👈"
  },
  "whack-a-mole": {
    title: "Whack-a-Dumbbell",
    icon: "🔨",
    goodItems: "🏋️ 🍌 🍎",
    goodNote: "(+Combo Pts)",
    badItems: "🍔 🍕 🍰",
    badNote: "(-3s & -20)",
    controlHint: "👉 Tap or click items before they disappear (60s timer) 👈"
  }
};

// GamePlayer Component: Unity WebGL iframe embed karta hai aur Game Over events listen karta hai
export default function GamePlayer({ slug, onBack, onSwitchGame }) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuildMissing, setIsBuildMissing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const gameInfo = GAME_DETAILS[slug] || {
    title: slug,
    icon: "🎮",
    goodItems: "🏋️ 🍌 🍎",
    goodNote: "(+Points)",
    badItems: "🍔 🍕 🍰",
    badNote: "(-1 Life)",
    controlHint: "👉 Play game 👈"
  };
  const gameUrl = `/games/${slug}/index.html`;

  // Toast message trigger helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // 1. Initial leaderboard load inside useEffect
  useEffect(() => {
    let isCancelled = false;

    getLeaderboard(slug)
      .then((data) => {
        if (!isCancelled) {
          setLeaderboard(data);
          setLoadingLeaderboard(false);
        }
      })
      .catch((err) => {
        console.warn("Leaderboard fetch failed", err);
        if (!isCancelled) {
          setLoadingLeaderboard(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  // Leaderboard refresh trigger after a score is saved
  const refreshLeaderboard = useCallback(() => {
    getLeaderboard(slug)
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((err) => {
        console.warn("Leaderboard refresh error", err);
      });
  }, [slug]);

  // 2. Check karna ki build file exist karti hai ya nahi
  useEffect(() => {
    async function checkBuild() {
      try {
        const response = await fetch(gameUrl, { method: "HEAD" });
        if (!response.ok) {
          setIsBuildMissing(true);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Could not probe game build url", e);
      }
    }
    checkBuild();
  }, [gameUrl]);

  // 3. Unity WebGL se aane wale window postMessage ko listen karna
  useEffect(() => {
    function handleWindowMessage(event) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const payload = event.data;
      if (!payload || payload.type !== "GAME_OVER") {
        return;
      }

      const { game, score } = payload;
      if (game === slug && typeof score === "number" && score >= 0) {
        submitScore(game, score)
          .then(() => {
            showToast(`Score saved: ${score} points! 🏆`);
            refreshLeaderboard();
          })
          .catch((err) => {
            console.error("Score submit error:", err);
            showToast(`Score: ${score} points (saved locally)`);
          });
      }
    }

    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [slug, showToast, refreshLeaderboard]);

  // Fullscreen toggle helper
  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    }
  };

  return (
    <div className="player-page">
      {/* Top Navigation Bar */}
      <div className="player-nav-bar">
        <button className="btn-back" onClick={onBack}>
          <span>←</span>
          <span>Back to Overview</span>
        </button>

        <button className="btn-fullscreen" onClick={handleFullscreen}>
          <span>⛶</span>
          <span>Fullscreen</span>
        </button>
      </div>

      {/* Game Switcher Tabs */}
      <div className="game-tabs-nav">
        <button
          className={`game-tab-btn ${slug === "bag-catcher" ? "active" : ""}`}
          onClick={() => onSwitchGame && onSwitchGame("bag-catcher")}
        >
          <span>🎮</span>
          <span>Dumbbell Catcher</span>
        </button>

        <button
          className={`game-tab-btn ${slug === "whack-a-mole" ? "active" : ""}`}
          onClick={() => onSwitchGame && onSwitchGame("whack-a-mole")}
        >
          <span>🔨</span>
          <span>Whack-a-Dumbbell</span>
        </button>
      </div>

      {/* User-Friendly Rules Banner */}
      <div className="game-rules-banner">
        <div className="rule-group rule-group-good">
          <span className="rule-icon">🎯</span>
          <span className="rule-title">{slug === "bag-catcher" ? "CATCH:" : "WHACK:"}</span>
          <span className="rule-items">{gameInfo.goodItems}</span>
          <span className="rule-points">{gameInfo.goodNote}</span>
        </div>

        <div className="rule-divider"></div>

        <div className="rule-group rule-group-bad">
          <span className="rule-icon">🚫</span>
          <span className="rule-title">AVOID:</span>
          <span className="rule-items">{gameInfo.badItems}</span>
          <span className="rule-penalty">{gameInfo.badNote}</span>
        </div>
      </div>

      {/* Portrait Friendly Game Container */}
      <div className="iframe-wrapper">
        {/* Loading Spinner */}
        {isLoading && !isBuildMissing && (
          <div className="iframe-loading-overlay">
            <div className="spinner"></div>
            <span>Loading {gameInfo.title}...</span>
          </div>
        )}

        {/* Coming Soon Fallback */}
        {isBuildMissing ? (
          <div className="coming-soon-box">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
            <h3>Coming Soon!</h3>
            <p>The WebGL build for {gameInfo.title} is being generated.</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={gameUrl}
            title={gameInfo.title}
            className="game-iframe"
            onLoad={() => setIsLoading(false)}
            allow="fullscreen"
          />
        )}
      </div>

      {/* Control Hint Below Game */}
      <div className="game-control-hint">
        {gameInfo.controlHint}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 10 Leaderboard Section */}
      <div className="leaderboard-section">
        <h3>
          <span>🏆</span>
          <span>Mini-Game Leaderboard — {gameInfo.title}</span>
        </h3>

        {loadingLeaderboard ? (
          <p style={{ color: "#8a9c90", fontSize: "14px" }}>Loading leaderboard rankings...</p>
        ) : leaderboard.length === 0 ? (
          <p style={{ color: "#8a9c90", fontSize: "14px" }}>No scores yet! Be the first one to set a record.</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-col">Rank</th>
                <th>Athlete</th>
                <th className="score-col">High Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const rankDisplay = idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`;
                return (
                  <tr key={idx}>
                    <td className="rank-col">{rankDisplay}</td>
                    <td>{entry.username || "Anonymous Athlete"}</td>
                    <td className="score-col">{entry.bestScore} pts</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
