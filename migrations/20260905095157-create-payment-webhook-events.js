'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("payment_webhook_events", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    provider_event_id: {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
    },

    event_type: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    payload: {
      type: Sequelize.JSON,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM(
        "RECEIVED",
        "PROCESSED",
        "FAILED"
      ),
      allowNull: false,
      defaultValue: "RECEIVED",
    },

    processed_at: {
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
}

export async function down(queryInterface) {
  await queryInterface.dropTable("payment_webhook_events");
}