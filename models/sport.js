import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Sport = sequelize.define('sport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

export default Sport;
