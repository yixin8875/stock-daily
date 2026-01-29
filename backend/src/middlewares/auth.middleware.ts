import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { SessionService } from '../services/session.service';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new ApiError(500, 'JWT secret is not configured');
    }

    // 验证会话是否有效（检查黑名单）
    const isValid = await SessionService.isValidSession(token);
    if (!isValid) {
      throw new ApiError(401, 'Session has been invalidated');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};
