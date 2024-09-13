import { Router } from 'express';
import { adminOnly, authMiddleware } from '../middleware/authMiddleware';
import { addRoleController, editRoleController } from '../controller/roleController';

const router = Router();

router.post('/add-roles', authMiddleware, adminOnly, addRoleController);
router.put('/edit-roles/:roleId', authMiddleware, adminOnly, editRoleController);

export default router;
