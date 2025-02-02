import { DataTypes } from 'sequelize';
import sequelize from '../database.js'; // Adjust the path if needed

const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'client_admin'),
    defaultValue: 'client_admin',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

export default User;
