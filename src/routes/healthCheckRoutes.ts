import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health-check', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default router;

