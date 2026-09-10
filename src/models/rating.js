import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

const Rating = sequelize.define(
  "Rating",
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

    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    reviewed_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,

      validate: {
        min: 1,
        max: 5,
      },
    },

    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ratings",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Rating;
