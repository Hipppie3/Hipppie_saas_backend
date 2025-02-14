import express from 'express';
import { createPlayer } from '../controllers/playerController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', authenticateSession, createPlayer)

export default router;