import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Business = sequelize.define('business', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // optional: link to the admin who owns it
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true, // exact address
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facebook: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sport: {
    type: DataTypes.STRING, // "basketball", "tennis", etc.
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING, // "adult", "men", etc.
    allowNull: true,
  },
  season: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nextSeason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  signupDeadline: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  signupStatus: {
    type: DataTypes.ENUM("active", "closed"),
    allowNull: true,
  },
  cost: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skillLevel: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Business;
