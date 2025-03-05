import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


const PlayerGameStat = sequelize.define(
    "playerGameStat", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "player_game_stats",
      timestamps: true,
    }
  );
export default PlayerGameStat;