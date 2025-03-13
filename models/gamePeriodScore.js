import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; 

const GamePeriodScore = sequelize.define('gamePeriodScore', {
  gamePeriodId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'game_periods',
      key: 'id',
    },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  gameId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'games',
      key: 'id',
    },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  period_score_team1: {
    type: DataTypes.INTEGER,
    allowNull: true, // Score for team 1 in this game period
  },
  period_score_team2: {
    type: DataTypes.INTEGER,
    allowNull: true, // Score for team 2 in this game period
  },
}, {
  tableName: "game_period_scores",
  timestamps: true,
});

export default GamePeriodScore;
