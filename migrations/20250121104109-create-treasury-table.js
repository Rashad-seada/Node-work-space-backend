'use strict';

const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('treasuries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      transaction_type: {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false,
        comment: 'Type of transaction: income or expense',
      },
      specific_type: {
        type: Sequelize.ENUM(
            'sales',
            'suppliers payment',
            'salary payment',
            'rent',
            'utilities',
            'maintenance',
            'timer',
            'order',
            'reservation',
            'cash deposit',
            'cash withdrawal',
            'other'
        ),
        allowNull: true,
        comment: 'Specific type of transaction for detailed categorization',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Transaction amount',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional description or note about the transaction',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
        comment: 'Date of the transaction',
      },
      reconciliation_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Optional reconciliation date for closing the cash flow',
      },
      balance_after_transaction: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Treasury balance after this transaction',
      },
      cash_in_machine_before: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Cash available in the cashier machine before the transaction',
      },
      cash_in_machine_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cash available in the cashier machine after the transaction',
      },
      visa_in_machine_before: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'visa available in the cashier machine before the transaction',
      },
      visa_in_machine_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'visa available in the cashier machine after the transaction',
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'visa'),
        allowNull: false,
        comment: 'Type of paymentMethod: cash or visa',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('treasuries');
  },
};
