import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { ApiError } from './errorHandler';

interface RateLimitOptions {
  windowMs: number;      // 时间窗口（毫秒）
  max: number;           // 最大请求数
  keyPrefix?: string;    // 缓存键前缀
  message?: string;      // 超限提示信息
}

const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * 创建限流中间件
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    keyPrefix = 'default',
    message = 'Too many requests, please try again later',
  } = options;

  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 获取客户端标识（IP 或用户ID）
      const clientId = getClientId(req);
      const key = `${RATE_LIMIT_PREFIX}${keyPrefix}:${clientId}`;

      // 获取当前请求计数
      const current = await cacheService.get<number>(key) || 0;

      if (current >= max) {
        // 设置响应头
        res.set('X-RateLimit-Limit', String(max));
        res.set('X-RateLimit-Remaining', '0');
        res.set('Retry-After', String(windowSec));

        throw new ApiError(429, message);
      }

      // 增加计数
      await cacheService.set(key, current + 1, windowSec);

      // 设置响应头
      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(max - current - 1));

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        // Redis 不可用时放行
        next();
      }
    }
  };
};

/**
 * 获取客户端标识
 */
function getClientId(req: Request): string {
  // 优先使用用户ID
  const authReq = req as any;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }

  // 使用 IP 地址
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.ip || req.socket.remoteAddress || 'unknown';

  return `ip:${ip}`;
}
