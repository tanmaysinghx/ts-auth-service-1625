import { Router } from 'express';
import { 
  storeSession, 
  getSessions, 
  revokeSession, 
  validateSession
} from '../controller/sessionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/validate-session', validateSession);

router.use(authMiddleware);

router.post('/store-session', storeSession);

router.get('/get-sessions', getSessions);

router.patch('/:id/revoke', revokeSession);

export default router;