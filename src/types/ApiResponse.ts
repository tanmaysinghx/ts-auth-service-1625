export interface ApiResponse<T> {
  success: boolean;
  message: string;
  transactionId: any;
  data?: T;
  error?: string;
}
