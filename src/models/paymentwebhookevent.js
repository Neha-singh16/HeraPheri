import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PaymentWebhookEvent = sequelize.define(
  "PaymentWebhookEvent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    provider_event_id: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "RECEIVED",
        "PROCESSED",
        "FAILED"
      ),
      allowNull: false,
      defaultValue: "RECEIVED",
    },

    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payment_webhook_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default PaymentWebhookEvent;