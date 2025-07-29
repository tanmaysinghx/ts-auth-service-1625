import { Request, Response } from 'express';
import { changePasswordService, loginUser, refreshToken, registerUser, verifyTokenService } from '../services/authService';
import { errorResponse, successResponse } from '../utils/responseUtils';

interface CustomRequest extends Request {
  transactionId?: string;
}

/* Controller to register user */
export const register = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const user = await registerUser(req.body);
    return res.status(201).json(successResponse(user, "User is successfully registered", transactionId));
  } catch (err: any) {
    const errorMessage = err?.message || 'Registration failed';
    return res.status(400).json(errorResponse(errorMessage, "Registration error", transactionId,));
  }
};

/* Controller to login user */
export const login = async (req: CustomRequest, res: Response): Promise<Response> => {
  const transactionId = req.transactionId;
  try {
    const tokens = await loginUser(req.body);
    const { refreshToken, accessToken, email } = tokens;
    setCookies(res, refreshToken, accessToken, email);
    return res.status(201).json(successResponse(tokens, "User is successfully loggedin", transactionId));
  } catch (err: any) {
    const errorMessage = err?.message || 'Login failed';
    return res.status(401).json(errorResponse(errorMessage, "Login error", transactionId,));
  }
};

/* Controller to change user password */
export const changePasswordController = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const message = await changePasswordService(req.body);
    return res.status(201).json(successResponse(message, "Password chnaged succesfully", transactionId));
  } catch (err: any) {
    const errorMessage = err?.message || 'Password change failed';
    return res.status(401).json(errorResponse(errorMessage, "Password change error", transactionId,));
  }
};

/* Controller to generate jwt token using refresh token */
export const handleRefreshToken = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const newToken = await refreshToken(req.body.refreshToken);
    return res.status(201).json(successResponse({ accessToken: newToken }, "Refresh token generated", transactionId));
  } catch (err: any) {
    const errorMessage = err?.message || 'Invalid refresh token';
    return res.status(403).json(errorResponse(errorMessage, "Refresh token error", transactionId,));
  }
};

/* Controller to verify user token */
export const verifyTokenController = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const { token } = req.body;
    const result = await verifyTokenService(token);
    return res.status(201).json(successResponse(result, "Refresh token generated", transactionId));
  } catch (error: any) {
    const errorMessage = 'Invalid jwt token';
    return res.status(403).json(errorResponse(errorMessage, "Refresh token error", transactionId,));
  }
};

const setCookies = (res: Response, refreshToken: string, accessToken?: string, email?: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // maybe 'lax' or 'none' if cross-site, set with caution
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // If client needs JS access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 15 * 60 * 1000, // e.g., 15 mins for access token
    });
  }
};
