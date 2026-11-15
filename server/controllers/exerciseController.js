import prisma from "../lib/prisma.js";

// Fallback seed exercises if database is unreachable during viva / offline demo
const FALLBACK_EXERCISES = [
  { id: "ex-1", name: "Barbell Bench Press", category: "Compound", equipment: "Barbell", description: "Standard flat barbell chest press for overall pectoral development.", muscleGroups: ["Chest", "Triceps", "Shoulders"] },
  { id: "ex-2", name: "Incline Dumbbell Press", category: "Compound", equipment: "Dumbbell", description: "Upper chest focus with free dumbbells allowing deep stretch at bottom.", muscleGroups: ["Chest", "Shoulders", "Triceps"] },
  { id: "ex-3", name: "Cable Chest Fly", category: "Isolation", equipment: "Cable", description: "Constant tension pectoral fly isolating inner and lower chest fibers.", muscleGroups: ["Chest"] },
  { id: "ex-4", name: "Push Ups", category: "Compound", equipment: "Bodyweight", description: "Bodyweight horizontal pressing exercise strengthening core and chest.", muscleGroups: ["Chest", "Triceps"] },
  { id: "ex-5", name: "Lat Pulldown", category: "Compound", equipment: "Cable", description: "Vertical pulling motion building latissimus dorsi width and upper back.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-6", name: "Bent Over Barbell Row", category: "Compound", equipment: "Barbell", description: "Horizontal row developing back thickness, rhomboids, and rear delts.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-7", name: "Seated Cable Row", category: "Compound", equipment: "Cable", description: "Controlled cable pull targeting middle back and lat activation.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-8", name: "Barbell Deadlift", category: "Compound", equipment: "Barbell", description: "Posterior chain builder hitting lower back, glutes, and hamstrings.", muscleGroups: ["Back", "Hamstrings", "Glutes"] },
  { id: "ex-9", name: "Overhead Shoulder Press", category: "Compound", equipment: "Dumbbell", description: "Vertical overhead press focusing on anterior and lateral deltoids.", muscleGroups: ["Shoulders", "Triceps"] },
  { id: "ex-10", name: "Dumbbell Lateral Raise", category: "Isolation", equipment: "Dumbbell", description: "Side delt isolation to build shoulder width and capping.", muscleGroups: ["Shoulders"] },
  { id: "ex-11", name: "Cable Face Pull", category: "Isolation", equipment: "Cable", description: "Rear deltoid and rotator cuff builder promoting shoulder health.", muscleGroups: ["Shoulders", "Back"] },
  { id: "ex-12", name: "Standing Barbell Curl", category: "Isolation", equipment: "Barbell", description: "Biceps mass builder for peak and overall arm thickness.", muscleGroups: ["Biceps"] },
  { id: "ex-13", name: "Incline Dumbbell Curl", category: "Isolation", equipment: "Dumbbell", description: "Long head bicep isolation with maximum stretch in bottom position.", muscleGroups: ["Biceps"] },
  { id: "ex-14", name: "Triceps Rope Pushdown", category: "Isolation", equipment: "Cable", description: "Triceps lateral and medial head isolation with rope spread.", muscleGroups: ["Triceps"] },
  { id: "ex-15", name: "Overhead Triceps Extension", category: "Isolation", equipment: "Dumbbell", description: "Long head triceps builder in overhead stretched position.", muscleGroups: ["Triceps"] },
  { id: "ex-16", name: "Barbell Back Squat", category: "Compound", equipment: "Barbell", description: "King of lower-body movements targeting quads, glutes, and spinal erectors.", muscleGroups: ["Quadriceps", "Glutes"] },
  { id: "ex-17", name: "Leg Press", category: "Compound", equipment: "Machine", description: "Heavy quadriceps and leg overload without direct spinal loading.", muscleGroups: ["Quadriceps", "Glutes"] },
  { id: "ex-18", name: "Leg Extension", category: "Isolation", equipment: "Machine", description: "Direct quad isolation targeting rectus femoris and vastus lateralis.", muscleGroups: ["Quadriceps"] },
  { id: "ex-19", name: "Lying Leg Curl", category: "Isolation", equipment: "Machine", description: "Hamstring isolation exercise flexing the knee under resistance.", muscleGroups: ["Hamstrings"] },
  { id: "ex-20", name: "Romanian Deadlift", category: "Compound", equipment: "Barbell", description: "Hip-hinge movement maximizing hamstring stretch and glute hypertrophy.", muscleGroups: ["Hamstrings", "Glutes"] },
  { id: "ex-21", name: "Barbell Hip Thrust", category: "Compound", equipment: "Barbell", description: "Direct gluteus maximus builder with peak contraction at the top.", muscleGroups: ["Glutes", "Hamstrings"] },
  { id: "ex-22", name: "Standing Calf Raise", category: "Isolation", equipment: "Machine", description: "Gastrocnemius calf development through full ankle dorsiflexion.", muscleGroups: ["Quadriceps"] },
  { id: "ex-23", name: "Pull Ups", category: "Compound", equipment: "Bodyweight", description: "Pure bodyweight pulling movement for lats and bicep recruitment.", muscleGroups: ["Back", "Biceps"] },
  { id: "ex-24", name: "Hanging Leg Raise", category: "Isolation", equipment: "Bodyweight", description: "Abdominal and hip flexor movement developing lower core strength.", muscleGroups: ["Core"] }
];

/**
 * 1. GET /api/exercises
 * Saare exercises fetch karna with optional filters (search, muscle, equipment, category)
 * Viva point: Many-to-Many junction table (ExerciseMuscleGroup) se MuscleGroup ko JOIN karke query hoti hai.
 */
export async function getAllExercises(req, res) {
  try {
    const { q, muscle, equipment, category } = req.query;

    const where = {};

    if (q) {
      where.name = {
        contains: String(q),
        mode: "insensitive"
      };
    }

    if (equipment && equipment !== "All") {
      where.equipment = {
        equals: String(equipment),
        mode: "insensitive"
      };
    }

    if (category && category !== "All") {
      where.category = {
        equals: String(category),
        mode: "insensitive"
      };
    }

    if (muscle && muscle !== "All") {
      where.muscleGroups = {
        some: {
          muscleGroup: {
            name: {
              equals: String(muscle),
              mode: "insensitive"
            }
          }
        }
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        muscleGroups: {
          include: {
            muscleGroup: {
              select: { name: true }
            }
          }
        }
      }
    });

    const formatted = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      description: ex.description,
      equipment: ex.equipment,
      category: ex.category,
      muscleGroups: ex.muscleGroups.map(mg => mg.muscleGroup.name)
    }));

    return res.json({
      success: true,
      count: formatted.length,
      exercises: formatted
    });
  } catch (error) {
    console.warn("[ExerciseController] Database query failed. Serving fallback exercises.", error.message);

    // Apply in-memory filtering for offline / viva demo fallback
    let list = [...FALLBACK_EXERCISES];
    const { q, muscle, equipment, category } = req.query;

    if (q) {
      const queryLower = String(q).toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(queryLower));
    }

    if (muscle && muscle !== "All") {
      list = list.filter(e => e.muscleGroups.some(m => m.toLowerCase() === String(muscle).toLowerCase()));
    }

    if (equipment && equipment !== "All") {
      list = list.filter(e => e.equipment.toLowerCase() === String(equipment).toLowerCase());
    }

    if (category && category !== "All") {
      list = list.filter(e => e.category.toLowerCase() === String(category).toLowerCase());
    }

    return res.json({
      success: true,
      count: list.length,
      exercises: list,
      source: "fallback"
    });
  }
}

/**
 * 2. GET /api/exercises/muscle-groups
 * Available muscle groups list for filter chips
 */
export async function getMuscleGroups(req, res) {
  try {
    const groups = await prisma.muscleGroup.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });

    return res.json({
      success: true,
      muscleGroups: groups.map(g => g.name)
    });
  } catch {
    const fallbackGroups = [
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

    return res.json({
      success: true,
      muscleGroups: fallbackGroups,
      source: "fallback"
    });
  }
}

/**
 * 3. GET /api/exercises/:id
 * Single exercise detailed information
 */
export async function getExerciseById(req, res) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        muscleGroups: {
          include: {
            muscleGroup: { select: { name: true } }
          }
        }
      }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found"
      });
    }

    return res.json({
      success: true,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        equipment: exercise.equipment,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups.map(mg => mg.muscleGroup.name)
      }
    });
  } catch (error) {
    const fallbackEx = FALLBACK_EXERCISES.find(e => e.id === req.params.id);
    if (fallbackEx) {
      return res.json({ success: true, exercise: fallbackEx });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
