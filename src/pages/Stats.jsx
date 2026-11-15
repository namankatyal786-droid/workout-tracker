
import { useEffect, useState } from "react";
import "../styles/Stats.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://workout-tracker-production-a67a1737.up.railway.app/api";

const API_URL = `${API_BASE_URL}/stats`;

function Stats() {
  const [stats, setStats] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // One-Rep Max (1RM) Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcReps, setCalcReps] = useState(6);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load statistics");
        }

        setStats(data);

        if (data.exerciseProgression.length > 0) {
          setSelectedExercise(data.exerciseProgression[0].name);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="stats-page">Loading your statistics...</div>;
  }

  if (error) {
    return (
      <div className="stats-page">
        <h1>Workout Statistics</h1>
        <p className="stats-error">{error}</p>
        <button
          className="stats-retry"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overview, weeklyVolume, muscleGroupBreakdown, exerciseProgression } = stats;

  const selectedProgression = exerciseProgression.find(
    (exercise) => exercise.name === selectedExercise
  );

  const maxWeeklyVolume = Math.max(
    ...weeklyVolume.map((week) => week.volume), 1
  );

  const maxMuscleVolume = Math.max(
    ...muscleGroupBreakdown.map((group) => group.volume), 1
  );

  const maxExerciseWeight = Math.max(
    ...(selectedProgression?.entries.map((entry) => entry.maxWeight) || [1]), 1
  );

  const estimated1RM = Math.round(
    calcReps === 1 ? calcWeight : calcWeight * (1 + calcReps / 30)
  );

  const percentages = [
    { pct: 95, reps: "2 reps", weight: Math.round(estimated1RM * 0.95) },
    { pct: 90, reps: "4 reps", weight: Math.round(estimated1RM * 0.9) },
    { pct: 85, reps: "6 reps", weight: Math.round(estimated1RM * 0.85) },
    { pct: 80, reps: "8 reps", weight: Math.round(estimated1RM * 0.8) },
    { pct: 75, reps: "10 reps", weight: Math.round(estimated1RM * 0.75) },
    { pct: 70, reps: "12 reps", weight: Math.round(estimated1RM * 0.7) },
  ];

  return (
    <div className="stats-page">
      <div className="stats-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="stats-eyebrow">PERFORMANCE OVERVIEW</p>
          <h1>Your Statistics</h1>
          <p className="stats-subtitle">
            Understand your training volume and track your strength progress.
          </p>
        </div>

        <button
          type="button"
          className="btn-open-calculator"
          onClick={() => setShowCalculator(true)}
          title="Open One-Rep Max Calculator"
        >
          <span>🧮</span> 1RM Calculator
        </button>
      </div>

      <section className="stats-overview">
        <div className="stats-card">
          <span>Total Workouts</span>
          <strong>{overview.totalWorkouts}</strong>
          <small>Completed sessions</small>
        </div>
        <div className="stats-card">
          <span>Total Volume</span>
          <strong>{overview.totalVolume.toLocaleString("en-IN")}</strong>
          <small>kg lifted</small>
        </div>
        <div className="stats-card">
          <span>Completed Sets</span>
          <strong>{overview.totalSets}</strong>
          <small>Across all workouts</small>
        </div>
        <div className="stats-card">
          <span>Training Time</span>
          <strong>{overview.trainingHours}h</strong>
          <small>Total workout duration</small>
        </div>
      </section>

      <section className="stats-panel">
        <div className="stats-section-header">
          <div>
            <h2>Weekly Training Volume</h2>
            <p>Your total lifted weight over the last 8 weeks</p>
          </div>
          <span className="stats-unit">KG</span>
        </div>

        <div className="volume-chart">
          {weeklyVolume.map((week) => (
            <div className="volume-column" key={week.week}>
              <span className="volume-value">
                {week.volume > 0 ? week.volume.toLocaleString("en-IN") : ""}
              </span>
              <div className="volume-bar-area">
                <div
                  className="volume-bar"
                  style={{ height: `${(week.volume / maxWeeklyVolume) * 100}%` }}
                />
              </div>
              <span className="volume-label">{week.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="stats-two-column">
        <section className="stats-panel">
          <div className="stats-section-header">
            <div>
              <h2>Muscle Group Breakdown</h2>
              <p>Training volume by primary muscle group</p>
            </div>
          </div>

          {muscleGroupBreakdown.length === 0 ? (
            <p className="stats-empty">No muscle group data is available yet.</p>
          ) : (
            <div className="muscle-list">
              {muscleGroupBreakdown.map((group) => (
                <div className="muscle-item" key={group.name}>
                  <div className="muscle-item-info">
                    <strong>{group.name}</strong>
                    <span>{group.volume.toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="muscle-progress-track">
                    <div
                      className="muscle-progress-fill"
                      style={{ width: `${(group.volume / maxMuscleVolume) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="stats-panel">
          <div className="stats-section-header">
            <div>
              <h2>Exercise Progression</h2>
              <p>Track your best weight across workouts</p>
            </div>
          </div>

          {exerciseProgression.length === 0 ? (
            <p className="stats-empty">No exercise data available yet.</p>
          ) : (
            <>
              <select
                className="exercise-select"
                value={selectedExercise}
                onChange={(event) => setSelectedExercise(event.target.value)}
              >
                {exerciseProgression.map((exercise) => (
                  <option key={exercise.name} value={exercise.name}>
                    {exercise.name}
                  </option>
                ))}
              </select>

              {selectedProgression && (
                <>
                  <div className="progression-summary">
                    <span>Best recorded weight</span>
                    <strong>
                      {Math.max(...selectedProgression.entries.map(
                        (entry) => entry.maxWeight
                      ))} kg
                    </strong>
                  </div>

                  <div className="progression-chart">
                    {selectedProgression.entries.map((entry, index) => (
                      <div
                        className="progression-item"
                        key={`${entry.date}-${index}`}
                      >
                        <div className="progression-bar-area">
                          <div
                            className="progression-bar"
                            style={{
                              height: `${(entry.maxWeight / maxExerciseWeight) * 100}%`,
                            }}
                          />
                        </div>
                        <strong>{entry.maxWeight} kg</strong>
                        <span>
                          {new Date(entry.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {/* 1RM Calculator Modal */}
      {showCalculator && (
        <div className="calc-modal-overlay" onClick={() => setShowCalculator(false)}>
          <div className="calc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calc-header">
              <div>
                <h3>One-Rep Max (1RM) Calculator</h3>
                <p style={{ color: "#8a9c90", fontSize: "13px", margin: 0 }}>
                  Estimate maximum strength potential based on standard Epley / Brzycki formulas.
                </p>
              </div>
              <button
                type="button"
                className="calc-close-btn"
                onClick={() => setShowCalculator(false)}
              >
                ✕
              </button>
            </div>

            <div className="calc-inputs-grid">
              <div className="calc-input-group">
                <label>Weight Lifted (kg)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="calc-input"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div className="calc-input-group">
                <label>Repetitions Completed</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="calc-input"
                  value={calcReps}
                  onChange={(e) => setCalcReps(Math.max(1, Math.min(30, Number(e.target.value))))}
                />
              </div>
            </div>

            <div className="calc-result-box">
              <div className="calc-result-label">ESTIMATED 1-REP MAX</div>
              <div className="calc-result-number">{estimated1RM} kg</div>
            </div>

            <div className="calc-table-wrap">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>Percentage</th>
                    <th>Rep Target</th>
                    <th>Working Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {percentages.map((row) => (
                    <tr key={row.pct}>
                      <td><strong>{row.pct}%</strong></td>
                      <td>{row.reps}</td>
                      <td><strong style={{ color: "#a5e6b9" }}>{row.weight} kg</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                className="btn-open-calculator"
                onClick={() => setShowCalculator(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stats;
