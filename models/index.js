import sequelize from '../config/database.js'; 
import User from './user.js';
import League from './league.js';

// Define Associations
User.hasMany(League, { foreignKey: 'createdBy' }); // A user can create many leagues
League.belongsTo(User, { foreignKey: 'createdBy' }); // A league belongs to a user

// Export models
export { sequelize, User, League };
