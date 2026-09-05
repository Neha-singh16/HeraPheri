import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskProof = sequelize.define(
  "TaskProof",
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

    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
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
    },

    storage_key: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    text_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    review_status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "task_proofs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default TaskProof;