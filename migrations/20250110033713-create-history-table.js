"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Histories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: "Primary key, unique identifier for each transaction",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "admin_users", // Table name for the admin users
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      action: {
        type: Sequelize.ENUM(
            "USER_LOGIN",

            "ORDERED",
            "ORDER_PAID",
            "ORDER_DELETED",

            "SESSION_STARTED",
            "SESSION_ENDED",
            "SESSION_PAID",
            "SESSION_DELETED",

            "RESERVATION",
            "RESERVATION_PAID",
            "RESERVATION_DELETED",
        ),
        allowNull: false,
        comment: "The type of action performed",
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional details about the transaction, if any",
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Histories");
  },
};