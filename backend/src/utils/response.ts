import { Response } from 'express';
import { ErrorCode, ErrorMessages } from './errorCodes';

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: ErrorCode;
  message: string;
  data?: T;
  timestamp: number;
}

export function success<T>(res: Response, data?: T, message = '成功') {
  const response: ApiResponse<T> = {
    success: true,
    code: ErrorCode.SUCCESS,
    message,
    data,
    timestamp: Date.now(),
  };
  return res.json(response);
}

export function error(
  res: Response,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  message?: string,
  statusCode = 500
) {
  const response: ApiResponse = {
    success: false,
    code,
    message: message || ErrorMessages[code],
    timestamp: Date.now(),
  };
  return res.status(statusCode).json(response);
}
