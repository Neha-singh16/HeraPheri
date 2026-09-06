'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "users",
    "role",
    {
      type: Sequelize.ENUM(
        "USER",
        "ADMIN"
      ),
      allowNull: false,
      defaultValue: "USER",
    }
  );
}

export async function down(
  queryInterface
) {
  await queryInterface.removeColumn(
    "users",
    "role"
  );
}