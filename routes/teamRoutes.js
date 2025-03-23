import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import {getTeams, getTeamById, updateTeam, deleteTeam, getTeamsTest, getTeamPublic, getTeamListPublic} from '../controllers/teamController.js'


const router = express.Router();

router.get('/', getTeams)
router.get('/getTeamListPublic', getTeamListPublic)
router.get('/:id/teamPublic', getTeamPublic)
router.get('/teamsTest', getTeamsTest);
router.get('/:id', getTeamById)
router.put('/:id', authenticateSession, updateTeam)
router.delete('/:id', authenticateSession, deleteTeam)

export default router;