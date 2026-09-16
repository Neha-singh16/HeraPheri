import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  generateTaskDraftController,
} from "../controllers/aiController.js";

const router =
  express.Router();

router.use(authenticate);

router.post(
  "/task-draft",
  generateTaskDraftController,
);

export default router;