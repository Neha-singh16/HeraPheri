import express from "express";

import { authenticate } from "../middleware/authMiddleware.js";

import {
  createRatingController,
  getTaskRatingsController,
  getUserReputationController,
  getMyReputationController,
} from "../controllers/ratingController.js";

const router = express.Router();

router.use(authenticate);

// Submit rating for a completed task.
router.post("/tasks/:taskId", createRatingController);

// View ratings attached to a task.
router.get("/tasks/:taskId", getTaskRatingsController);

// Current user's reputation.
router.get("/me", getMyReputationController);

// Public-to-authenticated-users
// reputation summary.
router.get("/users/:userId", getUserReputationController);

export default router;
