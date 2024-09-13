import prisma from '../config/db';

export const addRole = async (data: { roleName: string }) => {
  return await prisma.role.create({
    data: {
      id: Math.random().toString(36).substr(2, 4),
      roleName: data.roleName,
    },
  });
};

export const editRole = async (roleId: string, data: { roleName: string }) => {
  return await prisma.role.update({
    where: { id: roleId },
    data: { roleName: data.roleName },
  });
};
