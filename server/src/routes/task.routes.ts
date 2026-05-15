import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
  updateTask,
} from "../controllers/task.controller";

import { protect } from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import validate from "../middlewares/validate.middleware";
import { createTaskSchema } from "../validators/task.validator";

const router = Router();

router.use(protect);
router.post(
  "/",
  upload.array("files", 3),
  createTask
);
// router.post("/", validate(createTaskSchema), createTask);s

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", updateTask); // 🔥 NEW

router.delete("/:id", deleteTask);

router.get("/file/:filename", protect, (req, res) => {
  const filePath = `src/uploads/${req.params.filename}`;
  res.download(filePath);
});
export default router;