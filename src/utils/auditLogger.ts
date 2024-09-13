import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';

export const logAudit = async (email: string, operation: string, userId: string, roleId: string) => {
  await prisma.audit.create({
    data: {
      id: uuidv4(),
      userId,
      roleId,
      email,
      operation,
      createdAt: new Date(),
      userIpAddress: '123.456.789.0',
    },
  });
};
