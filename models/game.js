import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


const Game = sequelize.define('game', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sportId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  team1_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  team2_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("scheduled", "completed", "canceled"),
    allowNull: true,
  },
  score_team1: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  score_team2: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Game;
