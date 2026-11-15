
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gamesRouter from "./routes/games.js";
import exercisesRouter from "./routes/exercises.js";
import prisma from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const DEMO_USER_ID = "90816367-c8d1-4d69-afc0-49b41eba4a21";

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Workout Tracker Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [workouts, personalRecords, sets] = await Promise.all([
      prisma.workout.findMany({
        where: {
          userId: DEMO_USER_ID,
          endedAt: { not: null },
        },
        orderBy: {
          startedAt: "desc",
        },
        include: {
          _count: {
            select: {
              exercises: true,
            },
          },
        },
      }),

      prisma.personalRecord.findMany({
        where: {
          userId: DEMO_USER_ID,
        },
        orderBy: {
          achievedAt: "desc",
        },
        take: 3,
        include: {
          exercise: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.workoutSet.findMany({
        where: {
          isCompleted: true,
          workoutExercise: {
            workout: {
              userId: DEMO_USER_ID,
              endedAt: { not: null },
            },
          },
        },
        select: {
          weight: true,
          reps: true,
        },
      }),
    ]);

    const totalWorkouts = workouts.length;

    const totalVolume = sets.reduce(
      (total, set) => total + Number(set.weight) * set.reps,
      0
    );

    const totalWorkoutMinutes = workouts.reduce((total, workout) => {
      return (
        total +
        (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
      );
    }, 0);

    const workoutHours = Math.round((totalWorkoutMinutes / 60) * 10) / 10;

    const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);

    const workoutDates = [
      ...new Set(workouts.map((workout) => getDateKey(workout.startedAt))),
    ].sort((a, b) => b.localeCompare(a));

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayKey = getDateKey(today);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    let currentStreak = 0;

    if (workoutDates[0] === todayKey || workoutDates[0] === yesterdayKey) {
      let expectedDate = new Date(`${workoutDates[0]}T00:00:00.000Z`);

      for (const workoutDate of workoutDates) {
        if (getDateKey(expectedDate) !== workoutDate) {
          break;
        }

        currentStreak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      }
    }

    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getUTCDay();

    weekStart.setUTCDate(
      weekStart.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setUTCDate(date.getUTCDate() + index);

      const dateKey = getDateKey(date);

      return {
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        date: dateKey,
        workouts: workouts.filter(
          (workout) => getDateKey(workout.startedAt) === dateKey
        ).length,
      };
    });

    const recentWorkouts = workouts.slice(0, 5).map((workout) => ({
      id: workout.id,
      name: workout.name,
      date: workout.startedAt,
      exercises: workout._count.exercises,
      duration: Math.round(
        (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
      ),
    }));

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        totalVolume: Math.round(totalVolume * 100) / 100,
        workoutTime: workoutHours,
        currentStreak,
      },
      weeklyActivity,
      personalRecords: personalRecords.map((record) => ({
        exercise: record.exercise.name,
        value: Number(record.value),
        recordType: record.recordType,
        date: record.achievedAt,
      })),
      recentWorkouts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load dashboard data",
    });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: {
        userId: DEMO_USER_ID,
        endedAt: { not: null },
      },
      orderBy: {
        startedAt: "desc",
      },
      include: {
        exercises: {
          orderBy: {
            position: "asc",
          },
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                equipment: true,
              },
            },
            sets: {
              orderBy: {
                setNumber: "asc",
              },
              select: {
                id: true,
                setNumber: true,
                setType: true,
                weight: true,
                reps: true,
                rpe: true,
                isCompleted: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    const history = workouts.map((workout) => {
      const completedSets = workout.exercises.flatMap((exercise) =>
        exercise.sets.filter((set) => set.isCompleted)
      );

      const totalVolume = completedSets.reduce(
        (total, set) => total + Number(set.weight) * set.reps,
        0
      );

      const duration = Math.max(
        0,
        Math.round(
          (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
        )
      );

      return {
        id: workout.id,
        name: workout.name,
        date: workout.startedAt,
        endedAt: workout.endedAt,
        duration,
        exerciseCount: workout.exercises.length,
        totalVolume: Math.round(totalVolume * 100) / 100,
        notes: workout.notes,
        exercises: workout.exercises.map((workoutExercise) => ({
          id: workoutExercise.id,
          position: workoutExercise.position,
          name: workoutExercise.exercise.name,
          category: workoutExercise.exercise.category,
          equipment: workoutExercise.exercise.equipment,
          notes: workoutExercise.notes,
          sets: workoutExercise.sets.map((set) => ({
            ...set,
            weight: Number(set.weight),
            rpe: set.rpe === null ? null : Number(set.rpe),
          })),
        })),
      };
    });

    res.json({
      success: true,
      total: history.length,
      workouts: history,
    });
  } catch (error) {
    console.error("History API error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load workout history",
    });
  }
});

app.delete("/api/history/:id", async (req, res) => {
  try {
    const result = await prisma.workout.deleteMany({
      where: {
        id: req.params.id,
        userId: DEMO_USER_ID,
        endedAt: { not: null },
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error("Delete workout error:", error);

    res.status(500).json({
      success: false,
      message: "Could not delete workout",
    });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: {
        userId: DEMO_USER_ID,
        endedAt: { not: null },
      },
      orderBy: {
        startedAt: "asc",
      },
      include: {
        exercises: {
          include: {
            exercise: {
              include: {
                muscleGroups: {
                  include: {
                    muscleGroup: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            sets: {
              where: {
                isCompleted: true,
              },
              select: {
                weight: true,
                reps: true,
              },
            },
          },
        },
      },
    });

    const allSets = workouts.flatMap((workout) =>
      workout.exercises.flatMap((exercise) => exercise.sets)
    );

    const totalVolume = allSets.reduce(
      (total, set) => total + Number(set.weight) * set.reps,
      0
    );

    const totalMinutes = workouts.reduce((total, workout) => {
      return (
        total +
        (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
      );
    }, 0);

    const totalSets = allSets.length;

    const getMonday = (date) => {
      const monday = new Date(date);
      monday.setUTCHours(0, 0, 0, 0);

      const day = monday.getUTCDay();

      monday.setUTCDate(
        monday.getUTCDate() - (day === 0 ? 6 : day - 1)
      );

      return monday;
    };

    const currentMonday = getMonday(new Date());
    const weeklyVolume = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

      const volume = workouts
        .filter((workout) => {
          const date = new Date(workout.startedAt);
          return date >= weekStart && date < weekEnd;
        })
        .reduce((total, workout) => {
          const workoutVolume = workout.exercises.reduce(
            (exerciseTotal, exercise) =>
              exerciseTotal +
              exercise.sets.reduce(
                (setTotal, set) =>
                  setTotal + Number(set.weight) * set.reps,
                0
              ),
            0
          );

          return total + workoutVolume;
        }, 0);

      weeklyVolume.push({
        week: weekStart.toISOString().slice(0, 10),
        label: weekStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }),
        volume: Math.round(volume),
      });
    }

    const muscleGroups = {};
    const exerciseHistory = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((workoutExercise) => {
        const exerciseName = workoutExercise.exercise.name;

        const exerciseVolume = workoutExercise.sets.reduce(
          (total, set) => total + Number(set.weight) * set.reps,
          0
        );

        const primaryGroups =
          workoutExercise.exercise.muscleGroups.filter(
            (group) => group.isPrimary
          );

        const assignedGroups =
          primaryGroups.length > 0
            ? primaryGroups
            : workoutExercise.exercise.muscleGroups;

        assignedGroups.forEach((group) => {
          const groupName = group.muscleGroup.name;

          muscleGroups[groupName] =
            (muscleGroups[groupName] || 0) + exerciseVolume;
        });

        if (!exerciseHistory[exerciseName]) {
          exerciseHistory[exerciseName] = {};
        }

        const workoutId = workout.id;

        if (!exerciseHistory[exerciseName][workoutId]) {
          exerciseHistory[exerciseName][workoutId] = {
            date: workout.startedAt,
            maxWeight: 0,
          };
        }

        workoutExercise.sets.forEach((set) => {
          exerciseHistory[exerciseName][workoutId].maxWeight = Math.max(
            exerciseHistory[exerciseName][workoutId].maxWeight,
            Number(set.weight)
          );
        });
      });
    });

    const muscleGroupBreakdown = Object.entries(muscleGroups)
      .map(([name, volume]) => ({
        name,
        volume: Math.round(volume),
      }))
      .sort((a, b) => b.volume - a.volume);

    const exerciseProgression = Object.entries(exerciseHistory)
      .map(([name, sessions]) => ({
        name,
        entries: Object.values(sessions)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((entry) => ({
            date: entry.date,
            maxWeight: entry.maxWeight,
          })),
      }))
      .sort((a, b) => b.entries.length - a.entries.length)
      .slice(0, 8);

    res.json({
      success: true,
      overview: {
        totalWorkouts: workouts.length,
        totalVolume: Math.round(totalVolume),
        totalSets,
        trainingHours: Math.round((totalMinutes / 60) * 10) / 10,
      },
      weeklyVolume,
      muscleGroupBreakdown,
      exerciseProgression,
    });
  } catch (error) {
    console.error("Stats API error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load workout statistics",
    });
  }
});

app.use("/api/games", gamesRouter);
app.use("/api/exercises", exercisesRouter);

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(
      `Workout Tracker API Server running on http://localhost:${PORT}`
    );
  });
}
