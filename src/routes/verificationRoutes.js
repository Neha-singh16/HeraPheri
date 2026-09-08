import express from "express";

import {
  authenticate,
  requireAdmin,
} from "../middleware/authMiddleware.js";

import {
  getMyVerificationController,
  startVerificationController,
  approveVerificationController,
  rejectVerificationController,
} from "../controllers/verificationController.js";

const router =
  express.Router();


// =============================================
// USER ROUTES
// =============================================

router.get(
  "/me",
  authenticate,
  getMyVerificationController
);

router.post(
  "/me/start",
  authenticate,
  startVerificationController
);


// =============================================
// ADMIN ROUTES
// =============================================

router.post(
  "/admin/:userId/approve",
  authenticate,
  requireAdmin,
  approveVerificationController
);

router.post(
  "/admin/:userId/reject",
  authenticate,
  requireAdmin,
  rejectVerificationController
);

export default router;

