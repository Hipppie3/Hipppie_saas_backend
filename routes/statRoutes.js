import express from 'express';
import { 
  getStatsBySport, 
  createStat, 
  updateStat, 
  deleteStat,
  resetStats,
  reorderStats,
  toggleStatVisibility
} from '../controllers/statController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get stats by sport ID
router.get('/:sportId', getStatsBySport);

// Create a new stat
router.post('/', authenticateSession, createStat);
// Add the toggle visibility route
router.put('/:id/toggle-visibility', authenticateSession, toggleStatVisibility);

// Reset stat
router.post('/reset', authenticateSession, resetStats)
router.put('/reorder', authenticateSession, reorderStats);

// Update a stat
router.put('/:id', authenticateSession, updateStat);

// Delete a stat
router.delete('/:id', authenticateSession, deleteStat);



export default router;