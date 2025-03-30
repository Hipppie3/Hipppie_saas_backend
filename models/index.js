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
import GamePeriodScore from './gamePeriodScore.js'
import PlayerAttribute from './playerAttribute.js';
import PlayerAttributeValue from './playerAttributeValue.js';
import Season from './season.js'; // Add this import
import Schedule from './schedule.js';


// League <--> Schedule Association
League.hasMany(Schedule, { foreignKey: 'leagueId', as: 'schedules' });
Schedule.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

Schedule.hasMany(Game, { foreignKey: 'scheduleId', as: 'games' });
Game.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });


// Player has many PlayerAttributeValues
Player.hasMany(PlayerAttributeValue, { foreignKey: 'player_id', as: 'attributeValues' });
PlayerAttributeValue.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// PlayerAttribute has many PlayerAttributeValues
PlayerAttribute.hasMany(PlayerAttributeValue, { foreignKey: 'attribute_id', as: 'values' });
PlayerAttributeValue.belongsTo(PlayerAttribute, { foreignKey: 'attribute_id', as: 'attribute' });


// User has many Seasons
User.hasMany(Season, { foreignKey: 'userId', as: 'seasons' });
Season.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Optionally, Season has many Leagues
Season.hasMany(League, { foreignKey: 'seasonId', as: 'leagues' });
League.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });


User.hasMany(PlayerAttribute, { foreignKey: 'user_id', as: 'playerAttributes' });
PlayerAttribute.belongsTo(User, { foreignKey: 'user_id', as: 'user' });





// Each attribute value is tied to an attribute definition
PlayerAttribute.hasMany(PlayerAttributeValue, { foreignKey: 'attribute_id', as: 'playerValues' });
PlayerAttributeValue.belongsTo(PlayerAttribute, { foreignKey: 'attribute_id', as: 'attributeDefinition' });



Game.belongsToMany(GamePeriod, { through: 'game_period_scores', foreignKey: 'gameId', as: 'periods' });
GamePeriod.belongsToMany(Game, { through: 'game_period_scores', foreignKey: 'gamePeriodId', as: 'games' });
GamePeriodScore.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });
GamePeriodScore.belongsTo(GamePeriod, { foreignKey: 'gamePeriodId', as: 'gamePeriod' });
Game.hasMany(GamePeriodScore, { foreignKey: 'gameId', as: 'periodScores' });
GamePeriod.hasMany(GamePeriodScore, { foreignKey: 'gamePeriodId', as: 'periodScores' });



// ✅ Game <--> GamePeriod Association
Sport.hasMany(GamePeriod, { foreignKey: 'sportId', as: 'periods' });
GamePeriod.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });

User.hasMany(GamePeriod, { foreignKey: 'userId', as: 'periods' });
GamePeriod.belongsTo(User, { foreignKey: 'userId', as: 'user' });


// PlayerGameStat associations (unchanged)
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

// User Associations (unchanged)
User.hasMany(League, { foreignKey: 'userId', as: 'leagues' });
User.hasMany(Team, { foreignKey: 'userId', as: 'teams' });
User.hasMany(Player, { foreignKey: 'userId', as: 'players' });
League.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Team.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Player.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// League <--> Team Association (unchanged)
League.hasMany(Team, { foreignKey: 'leagueId', as: 'teams' });
Team.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

// League <--> Player Association (unchanged)
League.hasMany(Player, { foreignKey: 'leagueId', as: 'players' });
Player.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

// Team <--> Player Association (unchanged)
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// ✅ Sport <--> Stat Association (unchanged)
Sport.hasMany(Stat, { foreignKey: 'sportId', as: 'stats' });
Stat.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });

// Game <--> Game Period Associations (unchanged)
League.hasMany(Game, { foreignKey: 'leagueId', as: 'games' });
Game.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });

Team.hasMany(Game, { foreignKey: 'team1_id', as: 'homeGames' });
Game.belongsTo(Team, { foreignKey: 'team1_id', as: 'homeTeam' });

Team.hasMany(Game, { foreignKey: 'team2_id', as: 'awayGames' });
Game.belongsTo(Team, { foreignKey: 'team2_id', as: 'awayTeam' });

// ✅ Export models with explicit associations
export { sequelize, User, League, Team, Player, Sport, Stat, Game, PlayerGameStat, GamePeriod, GamePeriodScore, PlayerAttribute, PlayerAttributeValue, Season, Schedule};
