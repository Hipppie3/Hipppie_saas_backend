import express from 'express';
import { getStats, getStatsBySport } from '../controllers/statController.js';

const router = express.Router();

router.get('/', getStats)
router.get('/:id', getStatsBySport); // Example: /api/stats/Basketball

export default router;
