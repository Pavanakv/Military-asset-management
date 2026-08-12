// routes/purchaseRoutes.js
import { Router } from 'express';
import { createPurchase, listPurchases } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBaseScopeBody } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Admins and Logistics Officers can log purchases; Base Commanders can view only.
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), enforceBaseScopeBody, createPurchase);
router.get('/', enforceBaseScope, listPurchases);

export default router;
