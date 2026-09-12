import express from "express";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminDisputeController,
  listAdminDisputesController,
  resolveAdminDisputeController,
} from "../controllers/adminDisputeController.js";

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/", listAdminDisputesController);
router.get("/:disputeId", getAdminDisputeController);
router.post("/:disputeId/resolve", resolveAdminDisputeController);

export default router;