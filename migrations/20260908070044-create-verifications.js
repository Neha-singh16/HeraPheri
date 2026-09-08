'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "verifications",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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

      verification_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "IDENTITY",
      },

      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "PENDING",
      },

      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      provider_reference: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    }
  );

  // One identity verification record per user in V1.
  await queryInterface.addIndex(
    "verifications",
    ["user_id", "verification_type"],
    {
      unique: true,
    }
  );

  await queryInterface.addIndex(
    "verifications",
    ["status"]
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable(
    "verifications"
  );
}