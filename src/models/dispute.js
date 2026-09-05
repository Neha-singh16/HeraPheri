import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Dispute = sequelize.define(
  "Dispute",
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

    raised_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "UNDER_REVIEW",
        "RESOLVED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },

    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    resolved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "disputes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Dispute;