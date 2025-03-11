import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; 

const GamePeriod = sequelize.define(
 "gamePeriod", {
  id: {
   type: DataTypes.INTEGER,
   autoIncrement: true,
   primaryKey: true,
  },
  userId: {
   type: DataTypes.INTEGER,
   allowNull: false,
  },
  gameId: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
   sportId: {
   type: DataTypes.INTEGER,
   allowNull: false,
  },
  name: {
   type: DataTypes.STRING,
   allowNuLL: true,
  },
  score_team1: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
  score_team2: {
   type: DataTypes.INTEGER,
   allowNull: true,
  }
 }, {
  timestamps: true,
 }
);

export default GamePeriod;