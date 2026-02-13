import { Request, Response } from 'express';
import { addRole, editRole } from '../services/roleService';
import { errorResponse, successResponse } from '../utils/responseUtils';

export const addRoleController = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const role = await addRole(req.body);
    return res.status(201).json(successResponse(role, "Role added successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to add role';
    return res.status(400).json(errorResponse(errorMessage, "Add role error", transactionId));
  }
};

export const editRoleController = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const role = await editRole(req.params.roleId, req.body);
    return res.status(200).json(successResponse(role, "Role updated successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to edit role';
    return res.status(400).json(errorResponse(errorMessage, "Edit role error", transactionId));
  }
};
