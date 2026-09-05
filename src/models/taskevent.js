import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskEvent = sequelize.define(
  "TaskEvent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    actor_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    event_type: {
      type: DataTypes.ENUM(
        "TASK_CREATED",
        "TASK_ASSIGNED",
        "TASK_STARTED",
        "TASK_ARRIVED",
        "PROOF_SUBMITTED",
        "TASK_APPROVED",
        "TASK_DISPUTED",
        "TASK_CANCELLED",
        "TASK_EXPIRED",
        "PAYMENT_HELD",
        "PAYMENT_RELEASED",
        "PAYMENT_REFUNDED"
      ),
      allowNull: false,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "task_events",
    timestamps: false,
  }
);

export default TaskEvent;