// routes/authRoutes.js
import { Router } from 'express';
import { login, registerUser, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
// Admin-only user provisioning (Base Commanders / Logistics Officers are created by an Admin)
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), registerUser);

export default router;
