import express from "express";
import {
  authenticate,
} from "../middleware/authMiddleware.js";
import { acceptTaskController ,   getMyAssignedTasksController,} from "../controllers/taskAssignmentController.js";

const router = express.Router();

router.post(
  "/:taskId/accept",
  authenticate,
  acceptTaskController
);

router.get(
  "/mine",
  authenticate,
  getMyAssignedTasksController
);
export default router;