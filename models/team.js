import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Team = sequelize.define('team', {
 name: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: false,
 },
 userId: {
  type: DataTypes.INTEGER,
  allowNull: false,
 },
  leagueId: {
  type: DataTypes.INTEGER,
  allowNull: false,
}
}, {
 timestamps: true,
});

export default Team;