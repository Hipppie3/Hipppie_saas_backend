import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; 
import User from './user.js'; // Import User model to set association

const League = sequelize.define('league', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Must match the actual table name
      key: 'id',
    },
    onDelete: 'CASCADE', // Deletes league if the user is deleted
  },
}, {
  timestamps: true,
});

export default League;
