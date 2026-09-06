import express from "express";

import {
  registerController,
  loginController,
  googleLoginController,
  logoutController,
  refreshController
} from "../controllers/authController.js";


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
export default router;