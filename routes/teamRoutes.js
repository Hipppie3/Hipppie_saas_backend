import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import {getTeams, getTeamById, updateTeam, deleteTeam, getTeamPublic, createTeam} from '../controllers/teamController.js'


const router = express.Router();

router.get('/', getTeams)
router.post('/', authenticateSession, createTeam)
router.get('/:id/teamPublic', getTeamPublic)
router.get('/:id', getTeamById)

router.put('/:id', authenticateSession, updateTeam)
router.delete('/:id', authenticateSession, deleteTeam)

export default router;