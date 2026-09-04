import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM("GO", "GET", "CHECK", "DIGITAL"),
      allowNull: false,
    },

    task_mode: {
      type: DataTypes.ENUM("PHYSICAL", "DIGITAL", "HYBRID"),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: true,
    },

    address_text: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    deadline_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    reward_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },

    risk_level: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
      defaultValue: "LOW",
    },

    proof_type: {
      type: DataTypes.ENUM(
        "PHOTO",
        "VIDEO",
        "RECEIPT",
        "DOCUMENT",
        "OTP",
        "TEXT_RESULT",
        "FILE"
      ),
      allowNull: false,
      defaultValue: "TEXT_RESULT",
    },

    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "PENDING_APPROVAL",
        "COMPLETED",
        "DISPUTED",
        "CANCELLED",
        "EXPIRED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Task;