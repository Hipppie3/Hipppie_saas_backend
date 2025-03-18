import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PlayerAttributeValue = sequelize.define(
  'player_attribute_value',
  {
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING, // All values stored as strings, cast as needed
      allowNull: true,
    },
  },
  { timestamps: true }
);

export default PlayerAttributeValue;
