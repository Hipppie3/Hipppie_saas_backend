import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Sport from './sport.js';

const Stat = sequelize.define('stat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sport,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default Stat;
