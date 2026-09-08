import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  getTaskMatchesController,
} from "../controllers/matchingController.js";

const router = express.Router();

// Matching requires an authenticated requester.
router.get(
  "/tasks/:taskId/candidates",
  authenticate,
  getTaskMatchesController
);

export default router;

