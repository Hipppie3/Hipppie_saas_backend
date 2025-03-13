import express from 'express';
import {getGamePeriodBySport, createGamePeriod, resetGamePeriod, deleteGamePeriod, hideGamePeriod, unhideGamePeriod, reorderGamePeriod} from '../controllers/gamePeriodController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:sportId', getGamePeriodBySport);
router.post('/', createGamePeriod);
router.put('/reorder', reorderGamePeriod)
router.put('/hide/:id', hideGamePeriod);
router.put('/unhide/:id', unhideGamePeriod);
router.post('/reset/:sportId', resetGamePeriod);
router.delete('/:id', deleteGamePeriod)


export default router;