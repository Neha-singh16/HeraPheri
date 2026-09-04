import express from "express";
import { acceptTaskController } from "../controllers/taskAssignmentController.js";

const router = express.Router();

router.post("/:taskId/accept", acceptTaskController);

export default router;