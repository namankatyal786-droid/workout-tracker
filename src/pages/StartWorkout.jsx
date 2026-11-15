import { useState, useEffect } from "react";
import { WEEKLY_ROUTINE, DAY_KEYS } from "../data/routineData";
import { playRestTimerChime } from "../utils/audio";
import "../styles/Workout.css";

export default function StartWorkout() {
  const todayIndex = new Date().getDay();
  const todayKey = DAY_KEYS[todayIndex];

  const [selectedDay, setSelectedDay] = useState(todayKey);

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const completionStorageKey = `workout_completed_${todayDateStr}`;

  // Persistent "Today's Workout Completed / Not Completed" state
  const [isTodayCompleted, setIsTodayCompleted] = useState(() => {
    try {
      return localStorage.getItem(completionStorageKey) === "true";
    } catch {
      return false;
    }
  });

  // Toggle workout completion status
  const toggleTodayCompletion = () => {
    setIsTodayCompleted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(completionStorageKey, next ? "true" : "false");
      } catch (e) {
        console.warn("Storage error", e);
      }
      return next;
    });
  };

  // Active workout session tracker state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [lastSessionSummary, setLastSessionSummary] = useState(null);
  const [completedSets, setCompletedSets] = useState({});

  // Session reflection and energy rating
  const [sessionNote, setSessionNote] = useState("");
  const [energyRating, setEnergyRating] = useState(4);

  // Dynamic custom exercises added by user to active routine
  const [extraExercises, setExtraExercises] = useState({});
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");

  // Rest interval countdown timer state
  const [restTimer, setRestTimer] = useState({
    active: false,
    remainingSeconds: 0,
    totalSeconds: 60,
    exerciseName: "",
    finished: false
  });

  const activeRoutine = WEEKLY_ROUTINE[selectedDay] || WEEKLY_ROUTINE.mon;
  const isSelectedDayToday = selectedDay === todayKey;

  const currentExtraExercises = extraExercises[selectedDay] || [];
  const currentRoutineExercises = [...(activeRoutine.exercises || []), ...currentExtraExercises];

  const QUICK_EXERCISES = [
    { name: "Push Ups", muscle: "Chest & Triceps", defaultWeight: "Bodyweight", rest: 60, tip: "Keep core tight." },
    { name: "Cable Face Pull", muscle: "Shoulders (Rear)", defaultWeight: "20 kg", rest: 60, tip: "Pull to nose level." },
    { name: "Dumbbell Lateral Raise", muscle: "Shoulders (Side)", defaultWeight: "10 kg", rest: 60, tip: "Lead with elbows." },
    { name: "Hanging Leg Raise", muscle: "Core & Abs", defaultWeight: "Bodyweight", rest: 60, tip: "Avoid swinging." },
    { name: "Barbell Deadlift", muscle: "Back & Hamstrings", defaultWeight: "80 kg", rest: 120, tip: "Keep spine neutral." },
    { name: "Barbell Hip Thrust", muscle: "Glutes", defaultWeight: "70 kg", rest: 90, tip: "Full lockout at top." },
    { name: "Standing Calf Raise", muscle: "Calves", defaultWeight: "40 kg", rest: 60, tip: "Full stretch at bottom." },
    { name: "Hammer Curl", muscle: "Biceps & Forearms", defaultWeight: "14 kg", rest: 60, tip: "Neutral palms grip." },
    { name: "Overhead Triceps Extension", muscle: "Triceps (Long Head)", defaultWeight: "18 kg", rest: 60, tip: "Keep elbows tucked." }
  ];

  const handleAddExerciseToRoutine = (ex) => {
    const existingCount = (extraExercises[selectedDay] || []).length;
    const cleanSlug = ex.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newEx = {
      id: `custom-${cleanSlug}-${existingCount + 1}`,
      name: ex.name,
      muscle: ex.muscle,
      sets: 3,
      reps: "10 - 12",
      targetWeight: ex.defaultWeight,
      restSeconds: ex.rest,
      tip: ex.tip,
      isCustom: true
    };

    setExtraExercises((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newEx]
    }));

    setIsAddingExercise(false);
    setAddSearchQuery("");
  };

  const handleRemoveCustomExercise = (id) => {
    setExtraExercises((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter((e) => e.id !== id)
    }));
  };

  // Active session stopwatch timer
  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  // Rest interval countdown countdown effect
  useEffect(() => {
    let interval = null;
    if (restTimer.active && restTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            playRestTimerChime();
            return { ...prev, remainingSeconds: 0, finished: true };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimer.active, restTimer.remainingSeconds]);

  const formatStopwatchTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      return `${hours}:${String(remMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Convert target weight string (e.g. "60 kg") dynamically to lbs if preferred
  const formatDisplayWeight = (targetWeightStr) => {
    if (!targetWeightStr || typeof targetWeightStr !== "string") return targetWeightStr;
    const preferredUnit = localStorage.getItem("preferred_unit") || "kg";
    if (preferredUnit === "kg") return targetWeightStr;

    const match = targetWeightStr.match(/^(\d+(?:\.\d+)?)\s*kg$/i);
    if (!match) return targetWeightStr;

    const kgValue = parseFloat(match[1]);
    const lbsValue = Math.round(kgValue * 2.20462);
    return `${lbsValue} lbs`;
  };

  // Toggle set completion checkbox and trigger rest timer
  const toggleSet = (exerciseId, setIdx) => {
    const key = `${exerciseId}-${setIdx}`;
    const willBeCompleted = !completedSets[key];

    setCompletedSets(prev => ({
      ...prev,
      [key]: willBeCompleted
    }));

    if (willBeCompleted) {
      const currentEx = currentRoutineExercises?.find((e) => e.id === exerciseId);
      const restSec = currentEx?.restSeconds || 60;
      setRestTimer({
        active: true,
        remainingSeconds: restSec,
        totalSeconds: restSec,
        exerciseName: currentEx?.name || "Exercise",
        finished: false
      });
    }
  };

  const adjustRestTime = (secondsToAdd) => {
    setRestTimer(prev => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + secondsToAdd),
      totalSeconds: Math.max(prev.totalSeconds, prev.remainingSeconds + secondsToAdd),
      finished: false
    }));
  };

  const closeRestTimer = () => {
    setRestTimer({
      active: false,
      remainingSeconds: 0,
      totalSeconds: 60,
      exerciseName: "",
      finished: false
    });
  };

  // Handle session finish: auto marks workout as completed!
  const handleFinishSession = () => {
    const setsCount = Object.values(completedSets).filter(Boolean).length;
    const finalSeconds = sessionElapsedSeconds;

    setLastSessionSummary({
      duration: formatStopwatchTime(finalSeconds),
      completedSetsCount: setsCount,
      routineName: activeRoutine.tag || activeRoutine.dayName,
      energy: energyRating,
      note: sessionNote.trim()
    });

    setIsSessionActive(false);
    setSessionElapsedSeconds(0);

    if (!isTodayCompleted) {
      setIsTodayCompleted(true);
      try {
        localStorage.setItem(completionStorageKey, "true");
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <div className="start-workout-page">
      {/* Page Header */}
      <div className="workout-header">
        <div>
          <div className="header-badge-row">
            <span className="routine-badge">📅 WEEKLY SPLIT ROUTINE</span>
            {isSelectedDayToday && (
              <span className="today-live-badge">⚡ TODAY&apos;S SCHEDULE</span>
            )}
            <span className={`status-pill-header ${isTodayCompleted ? "done" : "pending"}`}>
              {isTodayCompleted ? "✓ WORKOUT COMPLETED" : "⏳ NOT COMPLETED"}
            </span>
          </div>
          <h1 className="workout-title">Start Workout</h1>
          <p className="workout-subtitle">
            Personalized 7-day muscle split with sets, reps and target weights
          </p>
        </div>

        {/* Start / Finish Workout Button & Live Stopwatch */}
        {!activeRoutine.isHoliday && (
          <div className="workout-header-actions">
            {isSessionActive && (
              <div className="live-stopwatch-badge" title="Live Workout Duration">
                <span className="stopwatch-dot"></span>
                <span>{formatStopwatchTime(sessionElapsedSeconds)}</span>
              </div>
            )}
            <button
              className={`btn-start-session ${isSessionActive ? "btn-active-session" : ""}`}
              onClick={isSessionActive ? handleFinishSession : () => setIsSessionActive(true)}
            >
              <span>{isSessionActive ? "✓ Finish Workout" : "▶ Start Workout"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Session Completion Summary Banner */}
      {lastSessionSummary && (
        <div className="session-summary-banner">
          <div className="session-summary-info">
            <span className="session-summary-icon">🏆</span>
            <div>
              <div className="session-summary-title">Workout Completed Successfully!</div>
              <div className="session-summary-meta">
                <span>Routine: <strong>{lastSessionSummary.routineName}</strong></span>
                <span>•</span>
                <span>Duration: <strong>{lastSessionSummary.duration}</strong></span>
                <span>•</span>
                <span>Sets: <strong>{lastSessionSummary.completedSetsCount}</strong></span>
                {lastSessionSummary.energy && (
                  <>
                    <span>•</span>
                    <span>Energy: <strong>{"⚡".repeat(lastSessionSummary.energy)}</strong></span>
                  </>
                )}
                {lastSessionSummary.note && (
                  <>
                    <span>•</span>
                    <span><em>&quot;{lastSessionSummary.note}&quot;</em></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="session-summary-dismiss"
            onClick={() => setLastSessionSummary(null)}
            title="Dismiss summary"
          >
            ✕
          </button>
        </div>
      )}

      {/* Prominent Today's Workout Completed / Not Completed Toggle Bar */}
      <div className={`workout-status-bar ${isTodayCompleted ? "status-completed" : "status-pending"}`}>
        <div className="status-bar-left">
          <div className="status-icon-circle">
            {isTodayCompleted ? "✅" : "⏳"}
          </div>
          <div>
            <div className="status-title-row">
              <span className="status-label">TODAY&apos;S WORKOUT STATUS:</span>
              <span className={`status-pill ${isTodayCompleted ? "pill-done" : "pill-pending"}`}>
                {isTodayCompleted ? "COMPLETED" : "NOT COMPLETED"}
              </span>
            </div>
            <p className="status-subtext">
              {isTodayCompleted
                ? "🎉 Great job! Today's workout has been completed. Rest, hydrate and let your muscles recover!"
                : `💪 Scheduled for today (${WEEKLY_ROUTINE[todayKey]?.muscleFocus}). Hit the gym or log your sets!`}
            </p>
          </div>
        </div>

        <button
          className={`btn-toggle-completion ${isTodayCompleted ? "btn-mark-incomplete" : "btn-mark-complete"}`}
          onClick={toggleTodayCompletion}
        >
          <span>{isTodayCompleted ? "↺ Mark as Not Completed" : "✓ Mark as Completed"}</span>
        </button>
      </div>

      {/* 7-Day Selector Bar (Mon to Sun) with prominent TODAY badge */}
      <div className="days-navbar">
        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((key) => {
          const day = WEEKLY_ROUTINE[key];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;

          return (
            <button
              key={key}
              className={`day-tab-btn ${isSelected ? "selected" : ""} ${isToday ? "is-today" : ""} ${day.isHoliday ? "is-holiday" : ""}`}
              onClick={() => setSelectedDay(key)}
            >
              <div className="day-tab-header">
                <span className="day-tab-name">{day.dayName.slice(0, 3)}</span>
                {isToday && (
                  <span className={`today-chip-badge ${isTodayCompleted ? "completed" : ""}`}>
                    {isTodayCompleted ? "✓ TODAY" : "TODAY"}
                  </span>
                )}
              </div>
              <span className="day-tab-tag">{day.tag}</span>
              {day.isHoliday && <span className="day-holiday-pill">HOLIDAY</span>}
            </button>
          );
        })}
      </div>

      {/* Quick Jump to Today (if viewing another day) */}
      {!isSelectedDayToday && (
        <div className="jump-to-today-strip">
          <span>Viewing {activeRoutine.dayName}&apos;s schedule.</span>
          <button
            className="btn-jump-today"
            onClick={() => setSelectedDay(todayKey)}
          >
            ⚡ Jump to Today ({WEEKLY_ROUTINE[todayKey]?.dayName})
          </button>
        </div>
      )}

      {/* Active Day Card */}
      <div className={`routine-card ${activeRoutine.isHoliday ? "holiday-routine-card" : ""}`}>
        {/* Card Header */}
        <div className="routine-card-header">
          <div className="routine-card-left">
            <span className="day-icon">{activeRoutine.icon}</span>
            <div>
              <div className="day-title-row">
                <h2>{activeRoutine.dayName}</h2>
                <span className="muscle-pill">{activeRoutine.muscleFocus}</span>
                {isSelectedDayToday && (
                  <span className="today-badge-chip">TODAY</span>
                )}
              </div>
              <p className="routine-desc">{activeRoutine.description}</p>
            </div>
          </div>

          {!activeRoutine.isHoliday && (
            <div className="routine-meta-pills">
              <span className="meta-pill">⏱️ {activeRoutine.estimatedMinutes} mins</span>
              <span className="meta-pill">📋 {currentRoutineExercises.length} Exercises</span>
            </div>
          )}
        </div>

        {/* SUNDAY HOLIDAY VIEW */}
        {activeRoutine.isHoliday ? (
          <div className="holiday-view">
            <div className="holiday-hero">
              <div className="holiday-icon-large">🏖️</div>
              <h3>Sunday is a Rest Day (Holiday)</h3>
              <p>
                Muscles don&apos;t grow during your workouts — they grow when you rest and recover!
                Take today off to recharge your central nervous system, hydrate, and prepare for Monday&apos;s Push Day.
              </p>
            </div>

            <h4 className="recovery-section-title">💡 4 Pillars of Sunday Muscle Recovery</h4>
            <div className="recovery-grid">
              {activeRoutine.recoveryTips.map((tip, idx) => (
                <div key={idx} className="recovery-card">
                  <span className="recovery-icon">{tip.icon}</span>
                  <div>
                    <h5>{tip.title}</h5>
                    <p>{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MON-SAT WORKOUT EXERCISE LIST */
          <div className="exercise-list">
            <div className="exercise-list-header">
              <h3>Exercises for {activeRoutine.muscleFocus}</h3>
              {isSessionActive && (
                <span className="active-session-indicator">
                  🔴 Workout in progress — tap checkboxes as you complete sets
                </span>
              )}
            </div>

            <div className="exercise-cards-container">
              {currentRoutineExercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-card-header">
                    <div className="ex-number">{exIdx + 1}</div>
                    <div className="ex-info">
                      <h4>{exercise.name}</h4>
                      <span className="ex-muscle-tag">{exercise.muscle}</span>
                    </div>

                    <div className="ex-target-metrics">
                      <div className="metric-box">
                        <span className="metric-label">SETS</span>
                        <span className="metric-value">{exercise.sets}</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">REPS</span>
                        <span className="metric-value">{exercise.reps}</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">TARGET</span>
                        <span className="metric-value">{formatDisplayWeight(exercise.targetWeight)}</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">REST</span>
                        <span className="metric-value">{exercise.restSeconds}s</span>
                      </div>
                    </div>

                    {exercise.isCustom && (
                      <button
                        type="button"
                        className="btn-remove-custom-ex"
                        onClick={() => handleRemoveCustomExercise(exercise.id)}
                        title="Remove custom exercise"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Form Cue Tip */}
                  <div className="exercise-pro-tip">
                    <span className="tip-badge">PRO TIP</span>
                    <span>{exercise.tip}</span>
                  </div>

                  {/* Interactive Set Checkboxes (Active Workout Mode) */}
                  {isSessionActive && (
                    <div className="interactive-sets-row">
                      <span className="sets-row-label">Log Sets:</span>
                      <div className="sets-buttons-wrap">
                        {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                          const isDone = completedSets[`${exercise.id}-${sIdx}`];
                          return (
                            <button
                              key={sIdx}
                              className={`set-check-btn ${isDone ? "completed" : ""}`}
                              onClick={() => toggleSet(exercise.id, sIdx)}
                            >
                              <span>{isDone ? "✓ Set" : "Set"} {sIdx + 1}</span>
                              <span className="set-check-weight">
                                {formatDisplayWeight(exercise.targetWeight)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Exercise to Routine Button */}
            {!activeRoutine.isHoliday && (
              <div style={{ marginTop: "16px", marginBottom: "16px", textAlign: "center" }}>
                <button
                  type="button"
                  className="btn-add-exercise-routine"
                  onClick={() => setIsAddingExercise(true)}
                >
                  <span>＋</span> Add Exercise to Today&apos;s Split
                </button>
              </div>
            )}

            {/* Session Reflection & Energy Input */}
            {isSessionActive && (
              <div className="session-reflection-card">
                <div className="reflection-title-row">
                  <span className="reflection-icon">📝</span>
                  <h4>Session Reflection & Energy</h4>
                </div>
                <div className="reflection-fields-grid">
                  <div className="energy-selector-group">
                    <label>Perceived Energy:</label>
                    <div className="energy-rating-buttons">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className={`energy-btn ${energyRating >= lvl ? "active" : ""}`}
                          onClick={() => setEnergyRating(lvl)}
                        >
                          ⚡
                        </button>
                      ))}
                      <span className="energy-label-text">
                        {energyRating === 5
                          ? "Beast Mode 🔥"
                          : energyRating === 4
                          ? "High Energy ⚡"
                          : energyRating === 3
                          ? "Moderate 👍"
                          : "Fatigued 😴"}
                      </span>
                    </div>
                  </div>

                  <div className="session-note-group">
                    <label>Session Notes (Optional):</label>
                    <input
                      type="text"
                      className="session-note-input"
                      placeholder="e.g., Felt strong on barbell bench press, good shoulder stability..."
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Exercise Modal */}
      {isAddingExercise && (
        <div className="calc-modal-overlay" onClick={() => setIsAddingExercise(false)}>
          <div className="calc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calc-header">
              <div>
                <h3>Add Exercise to {activeRoutine.dayName}&apos;s Workout</h3>
                <p style={{ color: "#8a9c90", fontSize: "13px", margin: 0 }}>
                  Select an exercise to append to your active split routine.
                </p>
              </div>
              <button
                type="button"
                className="calc-close-btn"
                onClick={() => setIsAddingExercise(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                className="library-search-input"
                placeholder="Search exercise to add..."
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              {QUICK_EXERCISES.filter((ex) =>
                ex.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
                ex.muscle.toLowerCase().includes(addSearchQuery.toLowerCase())
              ).map((ex) => (
                <div
                  key={ex.name}
                  className="quick-add-item-row"
                  onClick={() => handleAddExerciseToRoutine(ex)}
                >
                  <div>
                    <strong style={{ color: "#ffffff", display: "block", fontSize: "14px" }}>
                      {ex.name}
                    </strong>
                    <span style={{ color: "#a5e6b9", fontSize: "12px" }}>
                      {ex.muscle} • {formatDisplayWeight(ex.defaultWeight)}
                    </span>
                  </div>
                  <button type="button" className="btn-quick-add">
                    ＋ Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Rest Timer Widget */}
      {restTimer.active && (
        <div className={`floating-rest-timer ${restTimer.finished ? "timer-finished" : ""}`}>
          <div className="rest-timer-left">
            <span className="rest-timer-icon">{restTimer.finished ? "🔔" : "⏳"}</span>
            <div>
              <div className="rest-timer-title">
                {restTimer.finished
                  ? "Rest Complete! Next set awaits"
                  : `Resting (${restTimer.exerciseName})`}
              </div>
              <div className="rest-timer-countdown">
                {formatStopwatchTime(restTimer.remainingSeconds)}
              </div>
            </div>
          </div>

          <div className="rest-timer-actions">
            {!restTimer.finished && (
              <>
                <button
                  type="button"
                  className="rest-timer-btn"
                  onClick={() => adjustRestTime(-15)}
                  title="Minus 15s"
                >
                  -15s
                </button>
                <button
                  type="button"
                  className="rest-timer-btn"
                  onClick={() => adjustRestTime(30)}
                  title="Plus 30s"
                >
                  +30s
                </button>
              </>
            )}
            <button
              type="button"
              className="rest-timer-btn close"
              onClick={closeRestTimer}
            >
              {restTimer.finished ? "Dismiss" : "Skip"}
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="rest-timer-progress-bar"
            style={{
              width: `${(restTimer.remainingSeconds / (restTimer.totalSeconds || 1)) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}
