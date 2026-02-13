export interface ApiResponse<T> {
  success: boolean;
  message: string;
  transactionId?: string;
  data?: T;
  error?: string;
}
