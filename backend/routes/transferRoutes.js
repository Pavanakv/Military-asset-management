// routes/transferRoutes.js
import { Router } from 'express';
import { createTransfer, listTransfers } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceTransferSourceScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Admins and Logistics Officers can initiate transfers; Base Commanders view only.
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), enforceTransferSourceScope, createTransfer);
router.get('/', enforceBaseScope, listTransfers);

export default router;
