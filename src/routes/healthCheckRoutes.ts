import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /health/health-check:
 *   get:
 *     summary: Service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health-check', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default router;
