import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const transactionIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.transactionId = uuidv4();
  next();
};
