import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; 

const League = sequelize.define('league', {
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
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
});

export default League;
