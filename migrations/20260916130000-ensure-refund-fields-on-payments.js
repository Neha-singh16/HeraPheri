"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const columns = await queryInterface.describeTable("payments");

  if (!columns.provider_refund_id) {
    await queryInterface.addColumn("payments", "provider_refund_id", {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });
  }

  if (!columns.refund_status) {
    await queryInterface.addColumn("payments", "refund_status", {
      type: Sequelize.ENUM("NONE", "PENDING", "PROCESSED", "FAILED"),
      allowNull: false,
      defaultValue: "NONE",
    });
  }
}

export async function down(queryInterface) {
  const columns = await queryInterface.describeTable("payments");

  if (columns.refund_status) {
    await queryInterface.removeColumn("payments", "refund_status");
  }

  if (columns.provider_refund_id) {
    await queryInterface.removeColumn("payments", "provider_refund_id");
  }
}