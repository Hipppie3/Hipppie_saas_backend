import { sequelize } from '../config/database.js';

import User from './user.js';
import League from './league.js';
import Team from './team.js';
import Player from './player.js';

// ✅ Define Associations with Explicit Aliases

// User Associations
User.hasMany(League, { foreignKey: 'userId', as: 'leagues' }); // A user can create many leagues
User.hasMany(Team, { foreignKey: 'userId', as: 'teams' }); // A user can create many teams
User.hasMany(Player, { foreignKey: 'userId', as: 'players' }); // A user can create many players
League.belongsTo(User, { foreignKey: 'userId', as: 'owner' }); // A league belongs to a user
Team.belongsTo(User, { foreignKey: 'userId', as: 'owner' }); // A team belongs to a user
Player.belongsTo(User, { foreignKey: 'userId', as: 'owner' }); // A player belongs to a user

// League <--> Team Association
League.hasMany(Team, { foreignKey: 'leagueId', as: 'teams' }); // A league has many teams
Team.belongsTo(League, { foreignKey: 'leagueId', as: 'league' }); // A team belongs to a league

// League <--> Player Association
League.hasMany(Player, { foreignKey: 'leagueId', as: 'players' }); // A league has many players
Player.belongsTo(League, { foreignKey: 'leagueId', as: 'league' }); // A player belongs to a league

// Team <--> Player Association
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players' }); // A team has many players
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'teams' }); // A player belongs to a team

// ✅ Export models with explicit associations
export { sequelize, User, League, Team, Player };
