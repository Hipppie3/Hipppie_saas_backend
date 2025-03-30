import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


const Game = sequelize.define('game', {
  userId: {
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
  video_url: {
    type: DataTypes.STRING,
    allow: true,
  },
  scheduleId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
weekIndex: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Game;
