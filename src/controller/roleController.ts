import { Request, Response } from 'express';
import { addRole, editRole } from '../services/roleService';

export const addRoleController = async (req: Request, res: Response) => {
  try {
    const role = await addRole(req.body);
    return res.status(201).json(role);
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to add role';
    return res.status(400).json({ error: errorMessage });
  }
};

export const editRoleController = async (req: Request, res: Response) => {
  try {
    const role = await editRole(req.params.roleId, req.body);
    return res.status(200).json(role);
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to edit role';
    return res.status(400).json({ error: errorMessage });
  }
};

