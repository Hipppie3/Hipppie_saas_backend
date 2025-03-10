import express from 'express';
import { 
  getStatsBySport, 
  createStat, 
  updateStat, 
  deleteStat,
  resetStats,
  reorderStats
} from '../controllers/statController.js';

const router = express.Router();

// Get stats by sport ID
router.get('/:sportId', getStatsBySport);

// Create a new stat
router.post('/', createStat);

// Reset stat
router.post('/reset', resetStats)
router.put('/reorder', reorderStats);

// Update a stat
router.put('/:id', updateStat);

// Delete a stat
router.delete('/:id', deleteStat);



export default router;