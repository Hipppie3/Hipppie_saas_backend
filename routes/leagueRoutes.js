import express from 'express';
import { createLeague, getLeagues, getLeagueById, deleteLeague } from '../controllers/leagueController.js';
import { createTeam, getTeamsByLeague } from '../controllers/teamController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Allow both logged-in and public users to fetch leagues
router.get('/', getLeagues);
router.get('/:id', getLeagueById);
router.get('/:id/teams', getTeamsByLeague);

router.post('/', authenticateSession, createLeague);
router.delete('/:id', authenticateSession, deleteLeague);
router.post('/:id/teams', authenticateSession, createTeam);


export default router;
