import prisma from '../config/db';

export const getAllLogs = async () => {
  const logs = await prisma.audit.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return logs;
};
