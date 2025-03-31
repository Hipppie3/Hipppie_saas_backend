import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Bye = sequelize.define('bye', {
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schedules',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  weekIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  timestamps: true,
});

export default Bye;
