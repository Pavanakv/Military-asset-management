// routes/assignmentRoutes.js
import { Router } from 'express';
import {
  createAssignment,
  listAssignments,
  createExpenditure,
  listExpenditures,
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBaseScopeBody } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Base Commanders manage assignments/expenditures for their own base; Admins for any base.
router.post('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBaseScopeBody, createAssignment);
router.get('/assignments', enforceBaseScope, listAssignments);

router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBaseScopeBody, createExpenditure);
router.get('/expenditures', enforceBaseScope, listExpenditures);

export default router;
