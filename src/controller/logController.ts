import { Request, Response } from 'express';
import { getAllLogs } from '../services/logService';
import { errorResponse, successResponse } from '../utils/responseUtils';

interface CustomRequest extends Request {
  transactionId?: string;
}

/* Controller to get all logs for this application  */
export const getLogs = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const logs = await getAllLogs();
    return res.status(201).json(successResponse(logs, "Application logs generated succesfully", transactionId));
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to retrieve logs';
    return res.status(400).json(errorResponse(errorMessage, "Logs generation failure", transactionId));
  }
};
