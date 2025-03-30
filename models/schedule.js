import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Schedule = sequelize.define('schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'leagues', // Assuming 'leagues' is your reference table
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  numWeeks: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gameDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  weeklyDates: {
    type: DataTypes.ARRAY(DataTypes.DATE),
    allowNull: true,
  },
  sameSlot: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  timeSlots: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Stores the time slots for each game day (same every week)
    allowNull: true,
  },
  weeklyTimeSlots: {
    type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)), // Stores different time slots for each week
    allowNull: true,
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});


export default Schedule;
