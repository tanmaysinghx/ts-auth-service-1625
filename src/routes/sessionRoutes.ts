import { Router } from 'express';
import {
  storeSession,
  getSessions,
  revokeSession,
  validateSession
} from '../controller/sessionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /sessions/validate-session:
 *   post:
 *     summary: Validate a refresh token session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation failed
 */
router.post('/validate-session', validateSession);

router.use(authMiddleware);

/**
 * @swagger
 * /sessions/store-session:
 *   post:
 *     summary: Store session metadata (IP, device, location)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *               device:
 *                 type: string
 *                 example: Desktop
 *               browser:
 *                 type: string
 *                 example: Chrome
 *               os:
 *                 type: string
 *                 example: Windows 11
 *               location:
 *                 type: string
 *                 description: Fallback location if IP geolocation is unavailable
 *                 example: Asia/Kolkata
 *     responses:
 *       201:
 *         description: Session stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.post('/store-session', storeSession);

/**
 * @swagger
 * /sessions/get-sessions:
 *   get:
 *     summary: Get all active sessions for the logged-in user
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/get-sessions', getSessions);

/**
 * @swagger
 * /sessions/{id}/revoke:
 *   patch:
 *     summary: Revoke (logout) a specific session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to revoke
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Session not found or access denied
 *       500:
 *         description: Server error
 */
router.patch('/:id/revoke', revokeSession);

export default router;