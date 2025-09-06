import { DataTypes } from 'sequelize';
const sequelize = require('../config/sequelize');
const Delegation = require('./delegation.model');

const Agence = sequelize.define('Agence', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  delegationId: { type: DataTypes.INTEGER, allowNull: true },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'agences',
  timestamps: true
});

// Relation
Agence.belongsTo(Delegation, { foreignKey: 'delegationId', as: 'delegation' });

export default  Agence;
