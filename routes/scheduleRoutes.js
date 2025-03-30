import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import { createSchedule, getAllSchedules, getScheduleById, updateSchedule, deleteSchedule, generateGamesForSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/', getAllSchedules);
router.get('/:id', getScheduleById);


router.post('/', authenticateSession, createSchedule);
router.post('/:id/generate-games', generateGamesForSchedule);
router.put('/:id', authenticateSession, updateSchedule);
router.delete('/:id', authenticateSession, deleteSchedule);

export default router;