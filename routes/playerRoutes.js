import express from 'express';
import { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer } from '../controllers/playerController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', upload.single("image"), getPlayers)
router.get('/:id', upload.single("image"), getPlayerById)

router.post('/', authenticateSession, upload.single("image"), createPlayer)
router.put('/:id', authenticateSession, upload.single("image"), updatePlayer)
router.delete('/:id', authenticateSession, deletePlayer)

export default router;