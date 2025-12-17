const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Español',
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acceptedTerms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  return User;
};
