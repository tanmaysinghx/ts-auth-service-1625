import { Request, Response } from 'express';
import { changePasswordService, loginUser, refreshToken, registerUser, verifyTokenService } from '../services/authService';
import { errorResponse, successResponse } from '../utils/responseUtils';

/* Controller to register user */
export const register = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const user = await registerUser(req.body);
    return res.status(201).json(successResponse(user, "User registered successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed';
    return res.status(400).json(errorResponse(errorMessage, "Registration error", transactionId));
  }
};

/* Controller to login user */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const transactionId = req.transactionId;
  try {
    const tokens = await loginUser(req.body);
    const { refreshToken, accessToken } = tokens;
    setCookies(res, refreshToken, accessToken);
    return res.status(201).json(successResponse(tokens, "User logged in successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    return res.status(401).json(errorResponse(errorMessage, "Login error", transactionId));
  }
};

/* Controller to change user password */
export const changePasswordController = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const message = await changePasswordService(req.body);
    return res.status(201).json(successResponse(message, "Password changed successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Password change failed';
    return res.status(401).json(errorResponse(errorMessage, "Password change error", transactionId));
  }
};

/* Controller to generate jwt token using refresh token */
export const handleRefreshToken = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const newToken = await refreshToken(req.body.refreshToken);
    return res.status(201).json(successResponse({ accessToken: newToken }, "Refresh token generated", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid refresh token';
    return res.status(403).json(errorResponse(errorMessage, "Refresh token error", transactionId));
  }
};

/* Controller to verify user token */
export const verifyTokenController = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const { token } = req.body;
    const result = await verifyTokenService(token);
    return res.status(201).json(successResponse(result, "Token verified successfully", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid jwt token';
    return res.status(403).json(errorResponse(errorMessage, "Token verification error", transactionId));
  }
};

const setCookies = (res: Response, refreshToken: string, accessToken?: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 mins
    });
  }
};
