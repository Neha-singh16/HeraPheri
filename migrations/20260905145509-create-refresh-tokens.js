'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("refresh_tokens", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
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

    token_hash: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },

    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    revoked_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex(
    "refresh_tokens",
    ["user_id", "revoked_at"]
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("refresh_tokens");
}