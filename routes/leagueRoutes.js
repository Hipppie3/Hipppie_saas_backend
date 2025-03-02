import express from 'express';
import { createLeague, getLeagues, getLeagueById, updateLeague, deleteLeague, getLeaguesBySport } from '../controllers/leagueController.js';
import { createTeam, } from '../controllers/teamController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Allow both logged-in and public users to fetch leagues
router.get('/', getLeagues);
router.get('/sports', getLeaguesBySport)
router.get('/:id', getLeagueById);


router.post('/', authenticateSession, createLeague);
router.put('/:id', authenticateSession, updateLeague);
router.delete('/:id', authenticateSession, deleteLeague);
router.post('/:id/teams', authenticateSession, createTeam);



export default router;
