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
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ties: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unavailableSlots: {
  type: DataTypes.ARRAY(DataTypes.STRING),
  allowNull: true,
},
}, {
  timestamps: true,
  paranoid: true, // ✅ Enables soft delete
});

export default Team;