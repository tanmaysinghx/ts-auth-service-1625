import 'express';

declare global {
  namespace Express {
    interface Request {
      transactionId?: string;
      user?: {
        userId: string;
        roleId: string;
        email: string;
      };
      ssoSessionId?: string;
    }
  }
}
