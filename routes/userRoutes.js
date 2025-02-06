import express from 'express';
import { registerUser, getUsers, loginUser, deleteUser, logoutUser, checkAuth } from '../controllers/userController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check-auth', checkAuth)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', authenticateSession, getUsers); // Protected route
router.delete('/:id', authenticateSession, deleteUser);

export default router;
