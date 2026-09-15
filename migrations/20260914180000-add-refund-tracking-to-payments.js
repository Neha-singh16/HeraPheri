'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "provider_refund_id", {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("payments", "refund_status", {
      type: Sequelize.ENUM("NONE", "PENDING", "PROCESSED", "FAILED"),
      allowNull: false,
      defaultValue: "NONE",
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn("payments", "refund_status");
    await queryInterface.removeColumn("payments", "provider_refund_id");
}