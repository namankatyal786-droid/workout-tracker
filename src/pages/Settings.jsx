import { useState, useEffect } from "react";
import "../styles/Settings.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://workout-tracker-production-a67a1737.up.railway.app/api";

export default function Settings() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("workout_athlete_profile");
      return saved
        ? JSON.parse(saved)
        : {
            name: "Arnav Maheshwari",
            email: "arnavladdha450@gmail.com",
            fitnessGoal: "Hypertrophy & Muscle Growth",
            experience: "Intermediate (1-3 years)",
            bodyWeight: "72"
          };
    } catch {
      return {
        name: "Arnav Maheshwari",
        email: "arnavladdha450@gmail.com",
        fitnessGoal: "Hypertrophy & Muscle Growth",
        experience: "Intermediate (1-3 years)",
        bodyWeight: "72"
      };
    }
  });

  const [unit, setUnit] = useState(() => {
    return localStorage.getItem("preferred_unit") || "kg";
  });

  const [restTimerSound, setRestTimerSound] = useState(() => {
    return localStorage.getItem("rest_timer_sound") !== "false";
  });

  const [serverStatus, setServerStatus] = useState({
    status: "checking",
    message: "Pinging backend server...",
    latency: null
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Health check ping to Railway / local server
  const checkServerHealth = async (showChecking = false) => {
    const startTime = Date.now();
    try {
      if (showChecking) {
        setServerStatus({ status: "checking", message: "Checking connection...", latency: null });
      }
      const res = await fetch(`${API_BASE_URL}/health`);
      const latency = Date.now() - startTime;
      if (res.ok) {
        setServerStatus({
          status: "online",
          message: "Production API Server Connected (Healthy)",
          latency
        });
      } else {
        setServerStatus({
          status: "offline",
          message: `Server returned status ${res.status}`,
          latency
        });
      }
    } catch {
      setServerStatus({
        status: "offline",
        message: "Offline mode — using local storage fallback",
        latency: null
      });
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      const startTime = Date.now();
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        const latency = Date.now() - startTime;

        if (ignore) return;

        if (res.ok) {
          setServerStatus({
            status: "online",
            message: "Production API Server Connected (Healthy)",
            latency
          });
        } else {
          setServerStatus({
            status: "offline",
            message: `Server returned status ${res.status}`,
            latency
          });
        }
      } catch {
        if (!ignore) {
          setServerStatus({
            status: "offline",
            message: "Offline mode — using local storage fallback",
            latency: null
          });
        }
      }
    }

    loadHealth();

    return () => {
      ignore = true;
    };
  }, []);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem("preferred_unit", newUnit);
  };

  const handleToggleSound = () => {
    const next = !restTimerSound;
    setRestTimerSound(next);
    localStorage.setItem("rest_timer_sound", String(next));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("workout_athlete_profile", JSON.stringify(profile));
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-eyebrow">PREFERENCES & PROFILE</div>
        <h1 className="settings-title">Application Settings</h1>
        <p className="settings-subtitle">
          Manage your athlete profile, unit preferences, and backend connectivity
        </p>
      </div>

      {/* Profile Form */}
      <section className="settings-section">
        <h2 className="settings-section-title">
          <span>👤</span> Athlete Profile
        </h2>
        <p className="settings-section-desc">
          Your personal workout statistics and milestones are calculated using these metrics.
        </p>

        <form onSubmit={handleSaveProfile}>
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>Athlete Name</label>
              <input
                type="text"
                className="settings-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="settings-field">
              <label>Email Address</label>
              <input
                type="email"
                className="settings-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>

            <div className="settings-field">
              <label>Primary Fitness Goal</label>
              <select
                className="settings-select"
                value={profile.fitnessGoal}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
              >
                <option value="Hypertrophy & Muscle Growth">Hypertrophy & Muscle Growth</option>
                <option value="Maximum Strength & Powerlifting">Maximum Strength & Powerlifting</option>
                <option value="Endurance & Conditioning">Endurance & Conditioning</option>
                <option value="General Health & Mobility">General Health & Mobility</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Experience Level</label>
              <select
                className="settings-select"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              >
                <option value="Beginner (< 1 year)">Beginner (&lt; 1 year)</option>
                <option value="Intermediate (1-3 years)">Intermediate (1-3 years)</option>
                <option value="Advanced (3+ years)">Advanced (3+ years)</option>
              </select>
            </div>
          </div>

          <div className="settings-actions" style={{ marginTop: "20px" }}>
            <button type="submit" className="btn-save-settings">
              {savedFeedback ? "✓ Profile Saved!" : "Save Profile Details"}
            </button>
          </div>
        </form>
      </section>

      {/* App Preferences */}
      <section className="settings-section">
        <h2 className="settings-section-title">
          <span>⚙️</span> Training & Units Preferences
        </h2>
        <p className="settings-section-desc">Customize interface measurements and alert audio cues.</p>

        <div className="settings-toggle-row">
          <div className="toggle-info">
            <h4>Preferred Weight Measurement Unit</h4>
            <p>Choose between metric kilograms (kg) and imperial pounds (lbs)</p>
          </div>
          <div className="unit-switch-buttons">
            <button
              type="button"
              className={`unit-btn ${unit === "kg" ? "active" : ""}`}
              onClick={() => handleUnitChange("kg")}
            >
              Kilograms (kg)
            </button>
            <button
              type="button"
              className={`unit-btn ${unit === "lbs" ? "active" : ""}`}
              onClick={() => handleUnitChange("lbs")}
            >
              Pounds (lbs)
            </button>
          </div>
        </div>

        <div className="settings-toggle-row">
          <div className="toggle-info">
            <h4>Rest Interval Audio Alerts</h4>
            <p>Play chime notification when the set rest interval countdown completes</p>
          </div>
          <button
            type="button"
            className={`unit-btn ${restTimerSound ? "active" : ""}`}
            style={{ border: "1px solid #284432" }}
            onClick={handleToggleSound}
          >
            {restTimerSound ? "🔊 Enabled" : "🔇 Muted"}
          </button>
        </div>
      </section>

      {/* Backend & Diagnostics */}
      <section className="settings-section">
        <h2 className="settings-section-title">
          <span>🌐</span> Backend Server Health
        </h2>
        <p className="settings-section-desc">
          Live connection diagnostic to verify PostgreSQL and API status.
        </p>

        <div className="server-status-card">
          <div className="server-status-left">
            <span
              className={`server-dot ${serverStatus.status === "online" ? "" : "offline"}`}
            ></span>
            <div>
              <div className="server-status-title">
                {serverStatus.message}
                {serverStatus.latency !== null && (
                  <span style={{ color: "#a5e6b9", marginLeft: "8px", fontWeight: "400" }}>
                    ({serverStatus.latency} ms)
                  </span>
                )}
              </div>
              <div className="server-status-url">{API_BASE_URL}</div>
            </div>
          </div>

          <button
            type="button"
            className="server-refresh-btn"
            onClick={() => checkServerHealth(true)}
          >
            ↻ Check Ping
          </button>
        </div>
      </section>
    </div>
  );
}
