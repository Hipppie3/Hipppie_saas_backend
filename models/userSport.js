import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const UserSports = sequelize.define(
  "userSports",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    sportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "sports",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "user_sports",
    timestamps: true,
  }
);

export default UserSports;
