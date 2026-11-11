import { useState } from "react";
import SideBar from "./components/SideBar";
import MiniGames from "./pages/MiniGames";
import GamePlayer from "./pages/GamePlayer";
import "./styles/App.css";

// App Component: Main shell with sidebar navigation
// Viva point: State-driven page navigation pattern (activePage aur selectedGame state maintain karte hain)
function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedGame, setSelectedGame] = useState(null);

  // Sidebar navigation handler
  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    setSelectedGame(null); // Return to game cards list on sidebar click
  };

  return (
    <div className="app">
      <SideBar
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main className="main-content">
        {/* Mini Games Section */}
        {activePage === "mini-games" || activePage === "games" ? (
          selectedGame ? (
            <GamePlayer
              slug={selectedGame}
              onBack={() => setSelectedGame(null)}
              onSwitchGame={(newSlug) => setSelectedGame(newSlug)}
            />
          ) : (
            <MiniGames onSelectGame={(slug) => setSelectedGame(slug)} />
          )
        ) : (
          /* Default pages placeholder */
          <div>
            <h1>{activePage}</h1>
            <p>Track your workouts. Measure your progress.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
