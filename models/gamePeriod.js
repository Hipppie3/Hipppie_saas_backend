import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; 

const GamePeriod = sequelize.define('gamePeriod', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Periods are visible by default
  },
}, {
  tableName: "game_periods",
  timestamps: true,
});

export default GamePeriod;
