import express from 'express';
import { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer } from '../controllers/playerController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPlayers)
router.get('/:id', getPlayerById)

router.post('/', authenticateSession, createPlayer)
router.put('/:id', authenticateSession, updatePlayer)
router.delete('/:id', authenticateSession, deletePlayer)

export default router;