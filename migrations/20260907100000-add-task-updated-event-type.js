'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn("task_events", "event_type", {
    type: Sequelize.ENUM(
      "TASK_CREATED",
      "TASK_ASSIGNED",
      "TASK_STARTED",
      "TASK_ARRIVED",
      "PROOF_SUBMITTED",
      "TASK_APPROVED",
      "TASK_DISPUTED",
      "TASK_UPDATED",
      "TASK_CANCELLED",
      "TASK_EXPIRED",
      "PAYMENT_HELD",
      "PAYMENT_RELEASED",
      "PAYMENT_REFUNDED"
    ),
    allowNull: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn("task_events", "event_type", {
    type: Sequelize.ENUM(
      "TASK_CREATED",
      "TASK_ASSIGNED",
      "TASK_STARTED",
      "TASK_ARRIVED",
      "PROOF_SUBMITTED",
      "TASK_APPROVED",
      "TASK_DISPUTED",
      "TASK_CANCELLED",
      "TASK_EXPIRED",
      "PAYMENT_HELD",
      "PAYMENT_RELEASED",
      "PAYMENT_REFUNDED"
    ),
    allowNull: false,
  });
}