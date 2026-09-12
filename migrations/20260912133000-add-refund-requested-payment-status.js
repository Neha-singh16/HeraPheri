'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface) {
  await queryInterface.changeColumn(
    "payments",
    "status",
    {
      type: queryInterface.sequelize.Sequelize.ENUM(
        "PENDING",
        "AUTHORIZED",
        "HELD",
        "RELEASED",
        "REFUND_REQUESTED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "FAILED",
        "DISPUTED",
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
  );
}

export async function down() {
  // Keep rollback intentionally empty; MySQL ENUM rollback requires care.
}
