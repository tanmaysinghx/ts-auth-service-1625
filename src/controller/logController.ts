import { Request, Response } from 'express';
import { getAllLogs } from '../services/logService';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await getAllLogs();
    return res.json(logs);
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to retrieve logs';
    return res.status(400).json({ error: errorMessage });
  }
};
