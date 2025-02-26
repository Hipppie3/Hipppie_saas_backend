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
 age: {
  type: DataTypes.INTEGER,
  allowNull: true,
  unique: false,
 },
 image: {
  type: DataTypes.BLOB("long"),
  allowNull: true,
 },
 userId: {
  type: DataTypes.INTEGER,
  allowNull: false,
 },
 leagueId: {
  type: DataTypes.INTEGER,
  allowNull: true,
 },
 teamId: {
  type: DataTypes.INTEGER,
  allowNull: true
 }
}, {
 timestamps: true,
});

export default Player;