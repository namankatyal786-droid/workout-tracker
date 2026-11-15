const navigationItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "workout", icon: "↗", label: "Start Workout" },
  { id: "exercises", icon: "📚", label: "Exercise Library" },
  { id: "history", icon: "◷", label: "History" },
  { id: "stats", icon: "▥", label: "Stats" },
  { id: "mini-games", icon: "🎮", label: "Mini Games" },
];

function Sidebar({ activePage, onNavigate }) {
  let athleteName = "Arnav Maheshwari";
  let athleteGoal = "Personal Account";

  try {
    const saved = localStorage.getItem("workout_athlete_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name) athleteName = parsed.name;
      if (parsed.fitnessGoal) athleteGoal = parsed.fitnessGoal;
    }
  } catch {
    // Fallback to default
  }

  const avatarInitial = athleteName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">W</div>
        <div>
          <h2>WORKOUT</h2>
          <span>TRACKER</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">MENU</p>

        <nav className="sidebar-navigation">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${
            activePage === "settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("settings")}
        >
          <span className="nav-icon">⚙</span>
          <span>Settings</span>
        </button>

        <div
          className="sidebar-profile"
          onClick={() => onNavigate("settings")}
          style={{ cursor: "pointer" }}
          title="Open Athlete Profile & Settings"
        >
          <div className="profile-avatar">{avatarInitial}</div>
          <div className="profile-info">
            <strong>{athleteName}</strong>
            <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {athleteGoal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
