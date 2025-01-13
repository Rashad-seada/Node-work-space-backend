const { DataTypes } = require("sequelize");
const sequelize = require('../../../../core/database');

'use strict';

  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      tableName: 'Users', // Explicitly specify table name
      timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
  );

 

module.exports = {User}