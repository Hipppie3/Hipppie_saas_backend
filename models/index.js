import { sequelize } from '../config/database.js';

import User from './user.js';
import League from './league.js';
import Team from './team.js';
import Player from './player.js';
import Sport from './sport.js';
import Stat from './stat.js';
import Game from './game.js';
import PlayerGameStat from './playerGameStat.js';
import GamePeriod from './gamePeriod.js';

// ✅ Game <--> GamePeriod Association
Game.hasMany(GamePeriod, { foreignKey: 'gameId', as: 'periods' });
GamePeriod.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });
Sport.hasMany(GamePeriod, { foreignKey: 'sportId', as: 'periods' })
GamePeriod.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });
User.hasMany(GamePeriod, { foreignKey: 'userId', as: 'periods' });
GamePeriod.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Player.hasMany(PlayerGameStat, { foreignKey: 'player_id', as: 'gameStats' });
PlayerGameStat.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

Game.hasMany(PlayerGameStat, { foreignKey: 'game_id', as: 'playerStats' });
PlayerGameStat.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });

Stat.hasMany(PlayerGameStat, { foreignKey: 'stat_id', as: 'statRecords' });
PlayerGameStat.belongsTo(Stat, { foreignKey: 'stat_id', as: 'stat' });

// User Model
User.belongsToMany(Sport, { through: 'user_sports', foreignKey: 'userId', as: 'sports' });
// Sport Model
Sport.belongsToMany(User, { through: 'user_sports', foreignKey: 'sportId', as: 'users' });

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


League.hasMany(Game, { foreignKey: 'leagueId', as: 'games' });
Game.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

Team.hasMany(Game, { foreignKey: 'team1_id', as: 'homeGames' });
Game.belongsTo(Team, { foreignKey: 'team1_id', as: 'homeTeam' });

Team.hasMany(Game, { foreignKey: 'team2_id', as: 'awayGames' });
Game.belongsTo(Team, { foreignKey: 'team2_id', as: 'awayTeam' });

// ✅ Export models with explicit associations
export { sequelize, User, League, Team, Player, Sport, Stat, Game, PlayerGameStat, GamePeriod };
