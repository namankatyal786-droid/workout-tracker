import { useState, useEffect } from "react";
import "../styles/ExerciseLibrary.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://workout-tracker-production-a67a1737.up.railway.app/api";

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Core"
];

const EQUIPMENT_OPTIONS = ["All", "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"];

// Reliable built-in catalog for instant zero-latency loading and offline viva demos
const DEFAULT_CATALOG = [
  { id: "ex-1", name: "Barbell Bench Press", category: "Compound", equipment: "Barbell", description: "Standard flat barbell chest press for overall pectoral mass and pushing power. Keep your shoulder blades pinched and elbows angled at ~45 degrees.", muscleGroups: ["Chest", "Triceps", "Shoulders"] },
  { id: "ex-2", name: "Incline Dumbbell Press", category: "Compound", equipment: "Dumbbell", description: "Upper chest focus with independent dumbbells for balanced clavicular head activation and deeper stretch at the bottom.", muscleGroups: ["Chest", "Shoulders", "Triceps"] },
  { id: "ex-3", name: "Cable Chest Fly", category: "Isolation", equipment: "Cable", description: "Constant tension pectoral fly isolating inner and lower chest fibers with continuous resistance at peak contraction.", muscleGroups: ["Chest"] },
  { id: "ex-4", name: "Push Ups", category: "Compound", equipment: "Bodyweight", description: "Fundamental horizontal pressing movement building muscular endurance across the pectorals, triceps, and anterior delts.", muscleGroups: ["Chest", "Triceps"] },
  { id: "ex-5", name: "Lat Pulldown", category: "Compound", equipment: "Cable", description: "Vertical pulling motion building latissimus dorsi width and upper back thickness. Drive elbows down towards hips.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-6", name: "Bent Over Barbell Row", category: "Compound", equipment: "Barbell", description: "Horizontal rowing power movement targeting middle back, rhomboids, rear deltoids, and spinal stability.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-7", name: "Seated Cable Row", category: "Compound", equipment: "Cable", description: "Strict seated horizontal pull allowing controlled squeeze in the mid-back and lats without lower back fatigue.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-8", name: "Barbell Deadlift", category: "Compound", equipment: "Barbell", description: "Ultimate full posterior chain compound lift hitting the erectors, glutes, hamstrings, and upper traps.", muscleGroups: ["Back", "Hamstrings", "Glutes"] },
  { id: "ex-9", name: "Overhead Shoulder Press", category: "Compound", equipment: "Dumbbell", description: "Overhead vertical pressing building robust shoulder strength and thick anterior deltoids.", muscleGroups: ["Shoulders", "Triceps"] },
  { id: "ex-10", name: "Dumbbell Lateral Raise", category: "Isolation", equipment: "Dumbbell", description: "Side delt isolation creating wider shoulders and the classic V-taper aesthetic.", muscleGroups: ["Shoulders"] },
  { id: "ex-11", name: "Cable Face Pull", category: "Isolation", equipment: "Cable", description: "Essential rotator cuff and rear deltoid exercise promoting shoulder posture and bulletproofing the joint.", muscleGroups: ["Shoulders", "Back"] },
  { id: "ex-12", name: "Standing Barbell Curl", category: "Isolation", equipment: "Barbell", description: "Heavy mass builder for the biceps brachii. Maintain stationary elbows and avoid hip swinging.", muscleGroups: ["Biceps"] },
  { id: "ex-13", name: "Incline Dumbbell Curl", category: "Isolation", equipment: "Dumbbell", description: "Places maximum stretch on the long head of the biceps for peak height and arm thickness.", muscleGroups: ["Biceps"] },
  { id: "ex-14", name: "Triceps Rope Pushdown", category: "Isolation", equipment: "Cable", description: "Isolates the lateral and medial heads of the triceps. Flare the rope ends at full extension for peak contraction.", muscleGroups: ["Triceps"] },
  { id: "ex-15", name: "Overhead Triceps Extension", category: "Isolation", equipment: "Dumbbell", description: "Overhead stretch movement targeting the long head of the triceps responsible for upper arm size.", muscleGroups: ["Triceps"] },
  { id: "ex-16", name: "Barbell Back Squat", category: "Compound", equipment: "Barbell", description: "The premier leg developer building quad thickness, glutes, core brace, and systemic strength.", muscleGroups: ["Quadriceps", "Glutes"] },
  { id: "ex-17", name: "Leg Press", category: "Compound", equipment: "Machine", description: "Allows heavy quadriceps volume and knee flexion overload with zero spinal compression.", muscleGroups: ["Quadriceps", "Glutes"] },
  { id: "ex-18", name: "Leg Extension", category: "Isolation", equipment: "Machine", description: "Direct rectus femoris isolation with controlled squeeze at the top of the range of motion.", muscleGroups: ["Quadriceps"] },
  { id: "ex-19", name: "Lying Leg Curl", category: "Isolation", equipment: "Machine", description: "Knee-flexion hamstring movement targeting the biceps femoris and semitendinosus.", muscleGroups: ["Hamstrings"] },
  { id: "ex-20", name: "Romanian Deadlift", category: "Compound", equipment: "Barbell", description: "Hip-hinge pattern prioritizing hamstring stretch and gluteus maximus hypertrophy.", muscleGroups: ["Hamstrings", "Glutes"] },
  { id: "ex-21", name: "Barbell Hip Thrust", category: "Compound", equipment: "Barbell", description: "Highest gluteus maximus muscle activation with peak tension in full hip extension.", muscleGroups: ["Glutes", "Hamstrings"] },
  { id: "ex-22", name: "Standing Calf Raise", category: "Isolation", equipment: "Machine", description: "Develops the gastrocnemius through ankle plantar flexion with a pause at the peak.", muscleGroups: ["Quadriceps"] },
  { id: "ex-23", name: "Pull Ups", category: "Compound", equipment: "Bodyweight", description: "Upper-body pulling gold standard engaging lats, forearms, biceps, and core stabilizers.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-24", name: "Hanging Leg Raise", category: "Isolation", equipment: "Bodyweight", description: "Strict abdominal exercise flexing the pelvis upward to strengthen lower rectus abdominis.", muscleGroups: ["Core"] }
];

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState(DEFAULT_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedExerciseModal, setSelectedExerciseModal] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchServerExercises() {
      try {
        const res = await fetch(`${API_BASE_URL}/exercises`);
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.exercises) && data.exercises.length > 0) {
          setExercises(data.exercises);
        }
      } catch {
        // Keeps DEFAULT_CATALOG gracefully if offline
      }
    }

    fetchServerExercises();

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesMuscle =
      selectedMuscle === "All" ||
      ex.muscleGroups?.some((m) => m.toLowerCase() === selectedMuscle.toLowerCase());

    const matchesEquipment =
      selectedEquipment === "All" ||
      ex.equipment?.toLowerCase() === selectedEquipment.toLowerCase();

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
  };

  return (
    <div className="exercise-library-page">
      {/* Header */}
      <div className="library-header">
        <div>
          <div className="library-eyebrow">EXERCISE REPOSITORY</div>
          <h1 className="library-title">Exercise Library</h1>
          <p className="library-subtitle">
            Browse movement guides, muscle targets, and equipment instructions
          </p>
        </div>
        <div className="library-count-badge">
          {filteredExercises.length} of {exercises.length} Exercises
        </div>
      </div>

      {/* Search and Filters */}
      <div className="library-controls">
        <div className="library-search-wrap">
          <span className="library-search-icon">🔍</span>
          <input
            type="text"
            className="library-search-input"
            placeholder="Search exercises by name (e.g., Bench Press, Squat, Lat Pulldown)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Muscle Focus Filter */}
        <div className="filter-row">
          <span className="filter-label">Muscle:</span>
          <div className="filter-chips-wrap">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle}
                type="button"
                className={`filter-chip ${selectedMuscle === muscle ? "active" : ""}`}
                onClick={() => setSelectedMuscle(muscle)}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Filter */}
        <div className="filter-row">
          <span className="filter-label">Equipment:</span>
          <div className="filter-chips-wrap">
            {EQUIPMENT_OPTIONS.map((equip) => (
              <button
                key={equip}
                type="button"
                className={`filter-chip ${selectedEquipment === equip ? "active" : ""}`}
                onClick={() => setSelectedEquipment(equip)}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Exercises */}
      {filteredExercises.length > 0 ? (
        <div className="exercises-grid">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="exercise-item-card"
              onClick={() => setSelectedExerciseModal(exercise)}
            >
              <div>
                <div className="card-top-row">
                  <h3 className="card-title">{exercise.name}</h3>
                  <span
                    className={`category-tag ${
                      exercise.category?.toLowerCase() === "compound" ? "compound" : "isolation"
                    }`}
                  >
                    {exercise.category}
                  </span>
                </div>
                <p className="card-desc">
                  {exercise.description?.length > 95
                    ? `${exercise.description.slice(0, 95)}...`
                    : exercise.description}
                </p>
              </div>

              <div className="card-meta-row">
                <div className="card-muscles-list">
                  {exercise.muscleGroups?.map((m) => (
                    <span key={m} className="muscle-mini-pill">
                      {m}
                    </span>
                  ))}
                </div>
                <span className="card-equipment">⚙ {exercise.equipment}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-library-state">
          <p>No exercises match your search and filter criteria.</p>
          <button type="button" className="btn-reset-filters" onClick={resetFilters}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedExerciseModal && (
        <div className="modal-overlay" onClick={() => setSelectedExerciseModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span
                  className={`category-tag ${
                    selectedExerciseModal.category?.toLowerCase() === "compound"
                      ? "compound"
                      : "isolation"
                  }`}
                >
                  {selectedExerciseModal.category} Movement
                </span>
                <h3 style={{ marginTop: "6px" }}>{selectedExerciseModal.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedExerciseModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-section">
              <div className="modal-section-title">TARGET MUSCLE GROUPS</div>
              <div className="modal-muscles-wrap">
                {selectedExerciseModal.muscleGroups?.map((m) => (
                  <span key={m} className="modal-muscle-badge">
                    💪 {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-body-section">
              <div className="modal-section-title">REQUIRED EQUIPMENT</div>
              <div style={{ color: "#a5e6b9", fontSize: "14px", fontWeight: "600" }}>
                ⚙ {selectedExerciseModal.equipment}
              </div>
            </div>

            <div className="modal-body-section">
              <div className="modal-section-title">FORM CUES & EXECUTION</div>
              <div className="modal-desc-box">{selectedExerciseModal.description}</div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setSelectedExerciseModal(null)}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
