import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAdminStats,
  getUserById,
  getUsers,
  updateUser
} from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
