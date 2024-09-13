import { ApiResponse } from '../types/ApiResponse';

export const successResponse = <T>(data: T, message: string, transactionId: any): ApiResponse<T> => ({
  success: true,
  transactionId,
  message,
  data,
});

export const errorResponse = (error: string, message: string, transactionId: any): ApiResponse<null> => ({
  success: false,
  transactionId,
  message,
  error,
});
