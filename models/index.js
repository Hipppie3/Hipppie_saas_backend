import { sequelize } from '../config/database.js';

import User from './user.js';
import League from './league.js';
import Team from './team.js';
import Player from './player.js';

// Define Associations
User.hasMany(League, { foreignKey: 'userId' }); // A user can create many leagues
User.hasMany(Team, { foreignKey: 'userId' }); // A user can create many teams
User.hasMany(Player, { foreignKey: 'userId' }); // A user can create many players
League.belongsTo(User, { foreignKey: 'userId' }); // A league belongs to a user
Team.belongsTo(User, { foreignKey: 'userId' }); // A team belongs to a user
Player.belongsTo(User, { foreignKey: 'userId' }); // A player belongs to a user

// Add League <--> Team Association
League.hasMany(Team, { foreignKey: 'leagueId' }); // A league has many teams
Team.belongsTo(League, { foreignKey: 'leagueId' }); // A team belongs to a league

// Add League <--> Player Assocation
League.hasMany(Player, { foreignKey: 'leagueId' }); // A league has many players
Player.belongsTo(League, { foreignKey: 'leagueId' }); // A player belongs to a league

// Add Team <--> Player Association
Team.hasMany(Player, { foreignKey: 'teamId' }); // A team has many players
Player.belongsTo(Team, { foreignKey: 'teamId' }); // A player belongs to a team


// Export models
export { sequelize, User, League, Team, Player };
