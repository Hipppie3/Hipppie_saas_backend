import express from 'express';
import { createGame, getGames, getGameById, updateGameScores, deleteGame, getGamesByLeague, generateLeagueSchedule, updateGameDetails, getGamesBySchedule, generateWeeklyGames, getWeeklyGames, getWeeklyByes, generateFullSchedule, swapGames } from '../controllers/gameController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';
import { updatePeriodScores } from '../controllers/gamePeriodScoreController.js';

const router = express.Router();

router.get('/', getGames);
// routes/gameRoutes.js
router.get('/by-schedule', getGamesBySchedule);
router.get('/weekly-games', getWeeklyGames);
// routes/gameRoutes.js
router.get('/weekly-byes', getWeeklyByes);
router.put('/swap', swapGames)

router.post('/generate-weekly-games', generateWeeklyGames);
router.post('/generate-full-schedule', generateFullSchedule); //

router.post('/', authenticateSession, createGame);
router.post('/generate-schedule', generateLeagueSchedule);
router.put('/gamePeriodScores', updatePeriodScores); // ✅ Route for updating period scores
router.get('/league/:leagueId', getGamesByLeague)
router.get('/:id', getGameById);
router.put('/:id/details', authenticateSession, updateGameDetails)
router.put('/:id/scores', authenticateSession, updateGameScores);
router.delete('/:id', authenticateSession, deleteGame);

export default router;
