import { Router } from "express";
import {
  getAllExercises,
  getExerciseById,
  getMuscleGroups
} from "../controllers/exerciseController.js";

const router = Router();

// GET /api/exercises
router.get("/", getAllExercises);

// GET /api/exercises/muscle-groups
router.get("/muscle-groups", getMuscleGroups);

// GET /api/exercises/:id
router.get("/:id", getExerciseById);

export default router;
