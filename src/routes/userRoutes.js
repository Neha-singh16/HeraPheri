import express from "express";
import {
  authenticate,
} from "../middleware/authMiddleware.js";
import {
  updatePreferencesController,
  updateProfileController,
} from "../controllers/accountController.js";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      data: req.user,
    });
  }
);

router.patch(
  "/me",
  authenticate,
  updateProfileController,
);

router.patch(
  "/me/preferences",
  authenticate,
  updatePreferencesController,
);

export default router;