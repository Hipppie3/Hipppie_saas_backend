import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // Adjust the path if needed

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
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'client_admin'),
    defaultValue: 'client_admin',
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
    is: /^[a-z0-9\-]+$/i, // optional: make it URL-safe
  },
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'light'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt 
  // automatically
    tableName: 'users',  // Ensure the table name matches exactly
  freezeTableName: true,
});

export default User;
