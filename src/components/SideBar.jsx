
const navigationItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "workout", icon: "↗", label: "Start Workout" },
  { id: "exercises", icon: "◈", label: "Exercises" },
  { id: "templates", icon: "▤", label: "Templates" },
  { id: "history", icon: "◷", label: "History" },
  { id: "statistics", icon: "▥", label: "Statistics" },
  { id: "mini-games", icon: "🎮", label: "Mini Games" },
];

function Sidebar({ activePage, onNavigate }) {
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

        <div className="sidebar-profile">
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <strong>Your Profile</strong>
            <span>Personal Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
