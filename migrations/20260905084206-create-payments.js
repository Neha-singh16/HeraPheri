'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("payments", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    task_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    requester_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    executor_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    provider: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "RAZORPAY",
    },

    provider_order_id: {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    },

    provider_payment_id: {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    },

    gross_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    platform_fee: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    executor_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },

    status: {
      type: Sequelize.ENUM(
        "PENDING",
        "AUTHORIZED",
        "HELD",
        "RELEASED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "FAILED",
        "DISPUTED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    paid_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    released_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    refunded_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex(
    "payments",
    ["requester_id", "status"],
    {
      name: "payments_requester_status_idx",
    }
  );

  await queryInterface.addIndex(
    "payments",
    ["executor_id", "status"],
    {
      name: "payments_executor_status_idx",
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("payments");
}