import { sequelize } from '../config/database.js';

import User from './user.js';
import League from './league.js';
import Team from './team.js';
import Player from './player.js';
import Sport from './sport.js';
import Stat from './stat.js';

// ✅ Define Associations with Explicit Aliases

// User Associations
User.hasMany(League, { foreignKey: 'userId', as: 'leagues' });
User.hasMany(Team, { foreignKey: 'userId', as: 'teams' });
User.hasMany(Player, { foreignKey: 'userId', as: 'players' });
League.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Team.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Player.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// League <--> Team Association
League.hasMany(Team, { foreignKey: 'leagueId', as: 'teams' });
Team.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

// League <--> Player Association
League.hasMany(Player, { foreignKey: 'leagueId', as: 'players' });
Player.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

// Team <--> Player Association
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// ✅ Sport <--> Stat Association
Sport.hasMany(Stat, { foreignKey: 'sportId', as: 'stats' });
Stat.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });

// ✅ Export models with explicit associations
export { sequelize, User, League, Team, Player, Sport, Stat };
