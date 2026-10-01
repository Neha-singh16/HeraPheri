import express from "express";

import {
  registerController,
  loginController,
  googleLoginController,
  logoutController,
  refreshController
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { changePasswordController } from "../controllers/accountController.js";


const router = express.Router();

router.post(
  "/register",
  registerController
);

router.post(
  "/login",
  loginController
);

router.post(
  "/google",
  googleLoginController
);

router.post(
  "/refresh",
  refreshController
);

router.post(
  "/logout",
  logoutController
);

router.post(
  "/change-password",
  authenticate,
  changePasswordController,
);
export default router;