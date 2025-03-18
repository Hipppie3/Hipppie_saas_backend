import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PlayerAttribute = sequelize.define(
  'player_attribute',
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attribute_type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'date'),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true }
);

export default PlayerAttribute;
