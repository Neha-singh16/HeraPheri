import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    executor_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "RAZORPAY",
    },

    provider_order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    provider_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    gross_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    platform_fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    executor_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "AUTHORIZED",
        "HELD",
        "RELEASED",
        "REFUND_REQUESTED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "FAILED",
        "DISPUTED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    released_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Payment;