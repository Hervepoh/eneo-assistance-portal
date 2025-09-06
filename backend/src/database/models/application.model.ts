const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const ApplicationGroup = require('./applicationGroup.model');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  groupId: { type: DataTypes.INTEGER, allowNull: false },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'applications',
  timestamps: true
});

// Relation
Application.belongsTo(ApplicationGroup, { foreignKey: 'groupId', as: 'application' });

module.exports = Application;
