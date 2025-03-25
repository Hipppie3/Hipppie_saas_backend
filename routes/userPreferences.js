import express from 'express';
const router = express.Router();

// Save view mode to session
router.post('/view-mode', (req, res) => {
  req.session.viewMode = req.body.viewMode;
  res.json({ message: 'View mode saved' });
});

// Get view mode from session
router.get('/view-mode', (req, res) => {
  res.json({ viewMode: req.session.viewMode || 'card' });
});

export default router;
