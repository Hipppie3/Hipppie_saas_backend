import express from 'express';
import {getGamePeriodBySport, getDefaultGamePeriods, createGamePeriod, resetGamePeriod, deleteGamePeriod} from '../controllers/gamePeriodController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:sportId', getGamePeriodBySport);
router.get('/default/:sportId', getDefaultGamePeriods);
router.post('/', createGamePeriod);
router.post('/reset/:sportId', resetGamePeriod);
router.delete('/:id', deleteGamePeriod)


export default router;