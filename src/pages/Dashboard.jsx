
import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://workout-tracker-production-a67a1737.up.railway.app/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Dashboard request failed");
        }

        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard">Loading dashboard...</div>;
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

        <div className="dashboard-date">
          {formatDate(new Date())}
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
