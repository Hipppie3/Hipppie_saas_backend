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
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: 'SET NULL',
  },
  sportId: {  
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default League;
