
import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://workout-tracker-production-a67a1737.up.railway.app/api";

const FALLBACK_DASHBOARD = {
  success: true,
  stats: {
    totalWorkouts: 12,
    totalVolume: 42266,
    workoutTime: 14.5,
    currentStreak: 3,
  },
  weeklyActivity: [
    { day: "Mon", date: "2026-11-09", workouts: 1 },
    { day: "Tue", date: "2026-11-10", workouts: 1 },
    { day: "Wed", date: "2026-11-11", workouts: 0 },
    { day: "Thu", date: "2026-11-12", workouts: 1 },
    { day: "Fri", date: "2026-11-13", workouts: 1 },
    { day: "Sat", date: "2026-11-14", workouts: 0 },
    { day: "Sun", date: "2026-11-15", workouts: 1 },
  ],
  personalRecords: [
    { exercise: "Barbell Bench Press", value: 100, recordType: "MAX_WEIGHT", date: new Date().toISOString() },
    { exercise: "Lat Pulldown", value: 55, recordType: "ESTIMATED_1RM", date: new Date().toISOString() },
    { exercise: "Barbell Back Squat", value: 120, recordType: "MAX_WEIGHT", date: new Date().toISOString() },
  ],
  recentWorkouts: [
    { id: "demo-1", name: "Push Day", date: new Date().toISOString(), exercises: 4, duration: 52 },
    { id: "demo-2", name: "Pull Day", date: new Date(Date.now() - 86400000).toISOString(), exercises: 3, duration: 48 },
    { id: "demo-3", name: "Legs & Core", date: new Date(Date.now() - 86400000 * 3).toISOString(), exercises: 4, duration: 60 },
  ],
};

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchDashboard = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError("");

      const response = await fetch(`${API_BASE_URL}/dashboard`);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Dashboard request failed");
      }

      setDashboard(data);
      setIsOfflineMode(false);
    } catch (err) {
      console.warn("Dashboard fetch failed, using fallback metrics:", err.message);
      setDashboard(FALLBACK_DASHBOARD);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (ignore) return;

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Dashboard request failed");
        }

        setDashboard(data);
        setIsOfflineMode(false);
      } catch (err) {
        if (!ignore) {
          console.warn("Dashboard fetch failed, using fallback metrics:", err.message);
          setDashboard(FALLBACK_DASHBOARD);
          setIsOfflineMode(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initialFetch();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="skeleton-loader-wrap">
          <div className="skeleton-shimmer skeleton-header-box" />
          <div className="skeleton-grid-4">
            <div className="skeleton-shimmer skeleton-stat-card" />
            <div className="skeleton-shimmer skeleton-stat-card" />
            <div className="skeleton-shimmer skeleton-stat-card" />
            <div className="skeleton-shimmer skeleton-stat-card" />
          </div>
          <div className="skeleton-shimmer skeleton-chart-panel" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard">Error: {error}</div>;
  }

  const { stats, weeklyActivity, personalRecords, recentWorkouts } = dashboard;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const maxActivity = Math.max(
    ...weeklyActivity.map((item) => item.workouts),
    1
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Welcome Back, Athlete!</h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your fitness journey.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {isOfflineMode && (
            <button
              type="button"
              className="offline-mode-pill"
              onClick={() => fetchDashboard(true)}
              title="Click to retry connecting to production backend"
            >
              ⚠️ Offline Demo • Reconnect
            </button>
          )}
          <div className="dashboard-date">
            {formatDate(new Date())}
          </div>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon">◈</span>
          </div>
          <p className="stat-title">Total Workouts</p>
          <h2>{stats.totalWorkouts}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon">↗</span>
          </div>
          <p className="stat-title">Total Volume</p>
          <h2>
            {stats.totalVolume.toLocaleString("en-IN")}
            <span>kg</span>
          </h2>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon">◷</span>
          </div>
          <p className="stat-title">Workout Time</p>
          <h2>
            {stats.workoutTime}
            <span>hrs</span>
          </h2>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon">🔥</span>
          </div>
          <p className="stat-title">Current Streak</p>
          <h2>
            {stats.currentStreak}
            <span>days</span>
          </h2>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <div>
              <h3>Weekly Activity</h3>
              <p>Completed workouts this week</p>
            </div>
            <span className="card-badge">This Week</span>
          </div>

          <div className="activity-chart">
            {weeklyActivity.map((item) => (
              <div className="activity-column" key={item.date}>
                <div className="activity-bar-container">
                  <div
                    className="activity-bar"
                    style={{
                      height: `${(item.workouts / maxActivity) * 100}%`,
                    }}
                    title={`${item.workouts} workouts`}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card records-card">
          <div className="card-header">
            <div>
              <h3>Personal Records</h3>
              <p>Your latest achievements</p>
            </div>
            <span className="record-trophy">🏆</span>
          </div>

          <div className="records-list">
            {personalRecords.map((record, index) => (
              <div
                className="record-item"
                key={`${record.exercise}-${index}`}
              >
                <div>
                  <strong>{record.exercise}</strong>
                  <span>{formatDate(record.date)}</span>
                </div>
                <h4>{record.value} kg</h4>
              </div>
            ))}

            {personalRecords.length === 0 && (
              <p>No personal records yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card recent-card">
          <div className="card-header">
            <div>
              <h3>Recent Workouts</h3>
              <p>Your latest training sessions</p>
            </div>
          </div>

          <div className="workout-table">
            <div className="workout-table-header">
              <span>WORKOUT</span>
              <span>EXERCISES</span>
              <span>DURATION</span>
              <span>DATE</span>
            </div>

            {recentWorkouts.map((workout) => (
              <div className="workout-row" key={workout.id}>
                <div className="workout-name">
                  <strong>{workout.name}</strong>
                </div>
                <span>{workout.exercises}</span>
                <span>{workout.duration} min</span>
                <span>{formatDate(workout.date)}</span>
              </div>
            ))}

            {recentWorkouts.length === 0 && (
              <p>No workouts recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
