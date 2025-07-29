import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, roleId: string, email: string) => {
  return jwt.sign({ userId, roleId, email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1hr' });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });
};
