import express from 'express';
import { getDomain, registerUser, getUsers, loginUser, getUserById, updateUser, deleteUser, logoutUser, checkAuth } from '../controllers/userController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check-auth', checkAuth)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', authenticateSession, getUsers); // Protected route'
router.get('/:customDomain', getDomain)
router.put('/:id', authenticateSession, updateUser)
router.get('/:id', authenticateSession, getUserById)
router.delete('/:id', authenticateSession, deleteUser);

export default router;
