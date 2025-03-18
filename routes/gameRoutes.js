import express from 'express';
import { createGame, getGames, getGameById, updateGameScores, deleteGame, getGamesByLeague, generateLeagueSchedule, updateGameDetails } from '../controllers/gameController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';
import { updatePeriodScores } from '../controllers/gamePeriodScoreController.js';

const router = express.Router();

router.get('/', getGames);
router.post('/', authenticateSession, createGame);
router.post('/generate-schedule', generateLeagueSchedule);
router.put('/gamePeriodScores', updatePeriodScores); // ✅ Route for updating period scores
router.get('/league/:leagueId', getGamesByLeague)
router.get('/:id', getGameById);
router.put('/:id/details', authenticateSession, updateGameDetails)
router.put('/:id/scores', authenticateSession, updateGameScores);
router.delete('/:id', authenticateSession, deleteGame);

export default router;
