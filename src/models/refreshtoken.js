import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default RefreshToken;