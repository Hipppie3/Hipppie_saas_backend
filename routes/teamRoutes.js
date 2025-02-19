import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import {getTeams, getTeamById, updateTeam, deleteTeam} from '../controllers/teamController.js'


const router = express.Router();

router.get('/', getTeams)
router.get('/:id', getTeamById)
router.put('/:id', authenticateSession, updateTeam)
router.delete('/:id', authenticateSession, deleteTeam)

export default router;