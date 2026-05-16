import { Router } from "express";
import {
  createTask,
  deleteTask,
  downloadTaskFile,
  getTaskById,
  getTasks,
  updateTask
} from "../controllers/task.controller";
import { protect } from "../middlewares/auth.middleware";
import { upload } from "../config/multer";

const router = Router();

router.use(protect);

router.post(
  "/",
  upload.array("files", 3),
  createTask
);

router.get("/", getTasks);
router.get("/file/:filename", downloadTaskFile);
router.get("/:id", getTaskById);

router.put(
  "/:id",
  upload.array("files", 3),
  updateTask
);

router.delete("/:id", deleteTask);

export default router;
