import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


  const UserSport = sequelize.define('userSport', {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sportId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'sports',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
   timestamps: true,
  });


export default UserSport;
