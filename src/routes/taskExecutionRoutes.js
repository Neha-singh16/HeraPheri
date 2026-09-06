import express from "express";
import {
  authenticate,
} from "../middleware/authMiddleware.js";
import {
  startTaskController,
  submitProofController,
} from "../controllers/taskExecutionController.js";

const router = express.Router();

router.post(
  "/:taskId/start",
  authenticate,
  startTaskController
);

router.post(
  "/:taskId/proofs",
  authenticate,
  submitProofController
);

export default router;