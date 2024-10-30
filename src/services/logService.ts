import prisma from '../config/db';

/* Function to get all application logs */
export const getAllLogs = async () => {
  const logs = await prisma.audit.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return logs;
};
