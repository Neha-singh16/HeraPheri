import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskAssignment = sequelize.define(
  "TaskAssignment",
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

    executor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "RELEASED",
        "COMPLETED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    accepted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    arrived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    released_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "task_assignments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default TaskAssignment;