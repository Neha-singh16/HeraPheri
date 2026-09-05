import express from "express";

import {
  approveTaskController,
  createDisputeController,
} from "../controllers/taskReviewController.js";

const router = express.Router();

router.post(
  "/:taskId/approve",
  approveTaskController
);

router.post(
  "/:taskId/disputes",
  createDisputeController
);

export default router;