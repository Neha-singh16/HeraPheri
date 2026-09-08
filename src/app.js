import express from "express";
import cors from "cors";
import helmet from "helmet";
import taskExecutionRoutes from "./routes/taskExecutionRoutes.js";
import taskAssignmentRoutes from "./routes/taskAssignmentRoutes.js";
import taskReviewRoutes from "./routes/taskReviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paymentWebhookRoutes from "./routes/paymentWebhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

import executorProfileRoutes from "./routes/executorProfileRoutes.js";
import taskDiscoveryRoutes from "./routes/taskDiscoveryRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());

// Webhook must receive the raw request body.
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhookRoutes,
);

app.use(express.json());
app.use("/api/v1/users", userRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/executor-profile", executorProfileRoutes);

app.use("/api/v1/tasks", taskDiscoveryRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/tasks", taskExecutionRoutes);
app.use("/api/v1/matching", matchingRoutes);
app.use("/api/v1/tasks", taskAssignmentRoutes);

app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/tasks", taskReviewRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HEREPHERI API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;
