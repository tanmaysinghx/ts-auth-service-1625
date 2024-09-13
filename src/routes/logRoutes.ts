import { Router } from 'express';
import { adminOnly, authMiddleware } from '../middleware/authMiddleware';
import { getLogs } from '../controller/logController';

const router = Router();

router.get('/getAllLogs', authMiddleware, adminOnly, getLogs);

export default router;
