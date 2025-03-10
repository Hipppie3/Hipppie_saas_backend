import express from 'express';
import { 
  getStatsBySport, 
  createStat, 
  updateStat, 
  deleteStat,
  resetStats,
  reorderStats
} from '../controllers/statController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get stats by sport ID
router.get('/:sportId', getStatsBySport);

// Create a new stat
router.post('/', authenticateSession, createStat);

// Reset stat
router.post('/reset', authenticateSession, resetStats)
router.put('/reorder', authenticateSession, reorderStats);

// Update a stat
router.put('/:id', authenticateSession, updateStat);

// Delete a stat
router.delete('/:id', authenticateSession, deleteStat);



export default router;