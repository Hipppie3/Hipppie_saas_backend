import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Stat = sequelize.define("stat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sportId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "sports",
      key: "id",
    },
    onDelete: "SET NULL",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // ✅ Default order for sorting
  },
    hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, 
}, {
  timestamps: true,
});

export default Stat;
