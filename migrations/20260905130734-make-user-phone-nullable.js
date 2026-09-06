'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn(
    "users",
    "phone",
    {
      type: Sequelize.STRING(20),
      allowNull: true,
    }
  );
}

export async function down(
  queryInterface,
  Sequelize
) {
  await queryInterface.changeColumn(
    "users",
    "phone",
    {
      type: Sequelize.STRING(20),
      allowNull: false,
    }
  );
}