import express from "express";

import {
  startTaskController,
  submitProofController,
} from "../controllers/taskExecutionController.js";

const router = express.Router();

router.post(
  "/:taskId/start",
  startTaskController
);

router.post(
  "/:taskId/proofs",
  submitProofController
);

export default router;