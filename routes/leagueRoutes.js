import express from 'express';
import { createLeague, getLeagues, getLeagueById, deleteLeague }  from '../controllers/leagueController.js';
import { createTeam, getTeamsByLeague } from '../controllers/teamController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateSession, getLeagues );
router.post('/', authenticateSession, createLeague);


router.get('/:id/teams', authenticateSession, getTeamsByLeague);
router.post('/:id/teams', authenticateSession, createTeam)
router.get('/:id', authenticateSession, getLeagueById);
router.delete('/:id', authenticateSession, deleteLeague);
export default router;