import express from "express";
import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  approveTaskController,
  createDisputeController,
} from "../controllers/taskReviewController.js";

const router = express.Router();

router.post(
  "/:taskId/approve",
  authenticate,
  approveTaskController
);

router.post(
  "/:taskId/disputes",
  authenticate,
  createDisputeController
);
export default router;