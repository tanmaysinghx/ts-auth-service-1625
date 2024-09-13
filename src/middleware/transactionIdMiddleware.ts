import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface CustomRequest extends Request {
  transactionId?: string;
}

export const transactionIdMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  req.transactionId = uuidv4();
  next();
};
