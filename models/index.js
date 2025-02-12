import { sequelize } from '../config/database.js'; 
import User from './user.js';
import League from './league.js';
import Team from './team.js';

// Define Associations
User.hasMany(League, { foreignKey: 'userId' }); // A user can create many leagues
User.hasMany(Team, { foreignKey: 'userId' }); // A user can create many teams
League.belongsTo(User, { foreignKey: 'userId' }); // A league belongs to a user
Team.belongsTo(User, { foreignKey: 'userId' }); // A team belongs to a user

// Add League <--> Team Association
League.hasMany(Team, { foreignKey: 'leagueId' }); // A league has many teams

Team.belongsTo(League, { foreignKey: 'leagueId' }); // A team belongs to a league
console.log(League.associations)

// Export models
export { sequelize, User, League, Team };
