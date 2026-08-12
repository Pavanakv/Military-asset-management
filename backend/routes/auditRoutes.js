// routes/auditRoutes.js
import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Admin-only: the full system audit trail.
router.get('/', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { id: true, username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
