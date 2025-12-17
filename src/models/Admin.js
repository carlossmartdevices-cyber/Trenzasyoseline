const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    paymentLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'admin',
    timestamps: true,
  });

  return Admin;
};
