// routes/assetRoutes.js
import { Router } from 'express';
import {
  getDashboardMetrics,
  listBases,
  createBase,
  listEquipmentTypes,
  createEquipmentType,
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// All roles can view the dashboard, scoped to their own base if non-admin.
router.get('/dashboard', enforceBaseScope, getDashboardMetrics);

router.get('/bases', enforceBaseScope, listBases);
router.post('/bases', authorizeRoles('ADMIN'), createBase);

router.get('/equipment-types', listEquipmentTypes);
router.post('/equipment-types', authorizeRoles('ADMIN'), createEquipmentType);

export default router;
