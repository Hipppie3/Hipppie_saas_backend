import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import {getTeams, getTeamById, deleteTeam} from '../controllers/teamController.js'


const router = express.Router();

router.get('/', getTeams)
router.get('/:id', authenticateSession, getTeamById)
router.delete('/:id', authenticateSession, deleteTeam)

export default router;