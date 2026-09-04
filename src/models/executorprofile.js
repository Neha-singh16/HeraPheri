import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ExecutorProfile = sequelize.define(
  "ExecutorProfile",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    trust_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    completion_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    on_time_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_tasks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    completed_tasks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    current_location: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: true,
    },

    last_location_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "executor_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ExecutorProfile;