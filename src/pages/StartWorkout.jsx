import { useState, useEffect } from "react";
import { WEEKLY_ROUTINE, DAY_KEYS } from "../data/routineData";
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

  const activeRoutine = WEEKLY_ROUTINE[selectedDay] || WEEKLY_ROUTINE.mon;
  const isSelectedDayToday = selectedDay === todayKey;

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

  // Toggle set completion checkbox
  const toggleSet = (exerciseId, setIdx) => {
    const key = `${exerciseId}-${setIdx}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle session finish: auto marks workout as completed!
  const handleFinishSession = () => {
    const setsCount = Object.values(completedSets).filter(Boolean).length;
    const finalSeconds = sessionElapsedSeconds;

    setLastSessionSummary({
      duration: formatStopwatchTime(finalSeconds),
      completedSetsCount: setsCount,
      routineName: activeRoutine.tag || activeRoutine.dayName
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
                <span>Sets Completed: <strong>{lastSessionSummary.completedSetsCount}</strong></span>
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
              <span className="meta-pill">📋 {activeRoutine.exercises.length} Exercises</span>
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
              {activeRoutine.exercises.map((exercise, exIdx) => (
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
                        <span className="metric-value">{exercise.targetWeight}</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">REST</span>
                        <span className="metric-value">{exercise.restSeconds}s</span>
                      </div>
                    </div>
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
                              <span className="set-check-weight">{exercise.targetWeight}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
