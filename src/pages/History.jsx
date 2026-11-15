
import { useEffect, useState } from "react";
import "../styles/History.css";

const API_URL = "http://localhost:5001/api/history";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  return `${hours}h ${remainingMinutes}m`;
}

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load workout history");
      }

      setWorkouts(data.workouts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialHistory() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (ignore) return;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load workout history");
        }

        setWorkouts(data.workouts);
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialHistory();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (workoutId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${workoutId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete workout");
      }

      setWorkouts((current) =>
        current.filter((workout) => workout.id !== workoutId)
      );

      if (expandedWorkout === workoutId) {
        setExpandedWorkout(null);
      }
    } catch (err) {
      window.alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <p className="history-message">Loading workout history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <h1>Workout History</h1>
        <p className="history-error">{error}</p>
        <button className="history-retry" onClick={() => fetchHistory(true)}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <p className="history-eyebrow">YOUR TRAINING JOURNEY</p>
          <h1>Workout History</h1>
          <p className="history-subtitle">
            Review your previous workouts and track your progress.
          </p>
        </div>

        <div className="history-total">
          <strong>{workouts.length}</strong>
          <span>Total Workouts</span>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="history-empty">
          <h2>No workouts yet</h2>
          <p>Your completed workouts will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {workouts.map((workout) => {
            const isExpanded = expandedWorkout === workout.id;

            return (
              <div className="history-card" key={workout.id}>
                <div className="history-card-main">
                  <div className="history-workout-info">
                    <div className="history-workout-icon">W</div>

                    <div>
                      <h2>{workout.name}</h2>
                      <p>{formatDate(workout.date)}</p>
                    </div>
                  </div>

                  <div className="history-metrics">
                    <div>
                      <strong>{workout.exerciseCount}</strong>
                      <span>Exercises</span>
                    </div>

                    <div>
                      <strong>{formatDuration(workout.duration)}</strong>
                      <span>Duration</span>
                    </div>

                    <div>
                      <strong>
                        {workout.totalVolume.toLocaleString("en-IN")}
                      </strong>
                      <span>Volume (kg)</span>
                    </div>
                  </div>

                  <div className="history-actions">
                    <button
                      className="history-details-button"
                      onClick={() =>
                        setExpandedWorkout(isExpanded ? null : workout.id)
                      }
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>

                    <button
                      className="history-delete-button"
                      onClick={() => handleDelete(workout.id)}
                      title="Delete workout"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="history-details">
                    {workout.notes && (
                      <p className="history-notes">{workout.notes}</p>
                    )}

                    {workout.exercises.map((exercise) => (
                      <div
                        className="history-exercise"
                        key={exercise.id}
                      >
                        <div className="history-exercise-header">
                          <div>
                            <h3>{exercise.name}</h3>
                            <span>
                              {exercise.category} · {exercise.equipment}
                            </span>
                          </div>
                        </div>

                        <div className="history-set-table">
                          <div className="history-set-row history-set-heading">
                            <span>Set</span>
                            <span>Type</span>
                            <span>Weight</span>
                            <span>Reps</span>
                            <span>RPE</span>
                          </div>

                          {exercise.sets.map((set) => (
                            <div className="history-set-row" key={set.id}>
                              <span>{set.setNumber}</span>
                              <span>{set.setType}</span>
                              <span>{set.weight} kg</span>
                              <span>{set.reps}</span>
                              <span>{set.rpe ?? "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
