import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  createTaskController,
  getMyTasksController,
  getTaskController,
  updateTaskController,
  cancelTaskController,
} from "../controllers/taskController.js";

const router = express.Router();

// All task-management APIs require login.
router.use(authenticate);

router.post(
  "/",
  createTaskController
);

router.get(
  "/mine",
  getMyTasksController
);

router.get(
  "/:taskId",
  getTaskController
);

router.patch(
  "/:taskId",
  updateTaskController
);

router.post(
  "/:taskId/cancel",
  cancelTaskController
);

export default router;