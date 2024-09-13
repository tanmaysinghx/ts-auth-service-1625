import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, roleId: string) => {
  return jwt.sign({ userId, roleId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
};
