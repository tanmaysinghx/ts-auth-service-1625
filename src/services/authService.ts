import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { logAudit } from '../utils/auditLogger';

export const registerUser = async (data: { email: string; password: string; roleName: string }) => {
  const { email, password, roleName } = data;
  if (!email || !password || !roleName) {
    throw new Error('Email, password, and role name are required.');
  }
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new Error('User already exists with this email.');
  }
  const role = await prisma.role.findUnique({
    where: { roleName }
  });
  if (!role) {
    throw new Error('Role not found.');
  }
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: uuidv4().slice(0, 8),
      email,
      password: hashedPassword,
      roleId: role.id,
    },
  });
  await logAudit(user.email, 'register', user.id, user.roleId);
  return user;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');
  const accessToken = generateAccessToken(user.id, user.roleId);
  const refreshToken = generateRefreshToken(user.id);
  await prisma.user.update({ where: { email }, data: { lastLoginAt: new Date() } });
  logAudit(user.email, 'login', user.id, user.roleId);
  let roleId = user?.roleId;
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  let roleName = role?.roleName;
  return { accessToken, refreshToken, email, roleId, roleName };
};

export const changePasswordService = async (data: { email: string; currentPassword: string; newPassword: string }) => {
  const { email, currentPassword, newPassword } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new Error('New password must be different from the current password');
  }
  const hashedNewPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: hashedNewPassword, updatedAt: new Date() },
  });
  await logAudit(email, 'change-password', user.id, user.roleId);
  return 'Password updated successfully';
};

export const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }
  try {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    const newAccessToken = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' }
    );
    return newAccessToken;
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const verifyTokenService = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    if (typeof decoded === 'object' && decoded !== null) {
      return { success: true, message: "Token is valid", ...decoded };
    }
    return { success: true, message: "Token is valid", token: decoded };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};