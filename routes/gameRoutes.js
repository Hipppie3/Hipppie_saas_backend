import express from 'express';
import { createGame, getGames, getGameById, updateGameScores, deleteGame, getGamesByLeague, generateLeagueSchedule } from '../controllers/gameController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGames);
router.post('/', authenticateSession, createGame);
router.post('/generate-schedule', generateLeagueSchedule);
router.get('/league/:leagueId', getGamesByLeague)
router.get('/:id', getGameById);
router.put('/:id/scores', authenticateSession, updateGameScores);
router.delete('/:id', authenticateSession, deleteGame);

export default router;
