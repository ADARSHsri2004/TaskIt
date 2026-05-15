import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
} from "../controllers/task.controller";

import { protect } from "../middlewares/auth.middleware";

import validate from "../middlewares/validate.middleware";
import { createTaskSchema } from "../validators/task.validator";

const router = Router();

router.use(protect);

router.post("/", validate(createTaskSchema), createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.delete("/:id", deleteTask);

export default router;