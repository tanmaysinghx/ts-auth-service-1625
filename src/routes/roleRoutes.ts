import { Router } from 'express';
import { adminOnly, authMiddleware } from '../middleware/authMiddleware';
import { addRoleController, editRoleController } from '../controller/roleController';

const router = Router();

/**
 * @swagger
 * /roles/add-roles:
 *   post:
 *     summary: Add a new role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName]
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: Role added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation or creation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/add-roles', authMiddleware, adminOnly, addRoleController);

/**
 * @swagger
 * /roles/edit-roles/{roleId}:
 *   put:
 *     summary: Edit an existing role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName]
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: MODERATOR
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation or update error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/edit-roles/:roleId', authMiddleware, adminOnly, editRoleController);

export default router;
