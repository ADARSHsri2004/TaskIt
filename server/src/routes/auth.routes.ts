import { Router } from "express";
import { authorize } from "../middlewares/role.middleware";
import {
  login,
  logout,
  me,
  register
} from "../controllers/auth.controller";

import validate from "../middlewares/validate.middleware";

import {
  loginSchema,
  registerSchema
} from "../validators/auth.validator";

import {
  protect
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  protect,
  me
);



export default router;