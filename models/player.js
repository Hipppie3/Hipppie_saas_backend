import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Player = sequelize.define('player', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  image: {
    type: DataTypes.STRING, // Now stores image URL as a string
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "SET NULL",
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Player;
