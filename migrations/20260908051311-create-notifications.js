'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "notifications",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue:
          Sequelize.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:
          Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:
          Sequelize.fn("NOW"),
      },
    }
  );

  await queryInterface.addIndex(
    "notifications",
    ["user_id", "is_read"]
  );

  await queryInterface.addIndex(
    "notifications",
    ["created_at"]
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable(
    "notifications"
  );
}

