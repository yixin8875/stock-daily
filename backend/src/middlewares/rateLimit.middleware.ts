import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { ApiError } from './errorHandler';
import { logger } from '../services/logger.service';

interface RateLimitOptions {
  windowMs: number;      // 时间窗口（毫秒）
  max: number;           // 最大请求数
  keyPrefix?: string;    // 缓存键前缀
  message?: string;      // 超限提示信息
  skipFailedRequests?: boolean;  // 跳过失败请求
  blockDuration?: number; // 封禁时长（秒）
}

interface BruteForceOptions {
  freeRetries: number;   // 免费重试次数
  minWait: number;       // 最小等待时间（毫秒）
  maxWait: number;       // 最大等待时间（毫秒）
  lifetime: number;      // 记录生命周期（秒）
}

const RATE_LIMIT_PREFIX = 'ratelimit:';
const BRUTE_FORCE_PREFIX = 'bruteforce:';
const BLOCKED_PREFIX = 'blocked:';

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
  const authReq = req as any;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.ip || req.socket.remoteAddress || 'unknown';

  return `ip:${ip}`;
}

/**
 * 暴力破解防护中间件
 */
export const createBruteForceProtection = (options: BruteForceOptions) => {
  const { freeRetries, minWait, maxWait, lifetime } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = getClientId(req);
      const key = `${BRUTE_FORCE_PREFIX}${clientId}`;
      const attempts = await cacheService.get<number>(key) || 0;

      if (attempts >= freeRetries) {
        const waitTime = Math.min(minWait * Math.pow(2, attempts - freeRetries), maxWait);
        logger.warn(`Brute force protection triggered for ${clientId}, wait: ${waitTime}ms`);
        throw new ApiError(429, `请等待 ${Math.ceil(waitTime / 1000)} 秒后重试`);
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next();
      }
    }
  };
};

/**
 * 记录失败尝试
 */
export const recordFailedAttempt = async (req: Request): Promise<void> => {
  const clientId = getClientId(req);
  const key = `${BRUTE_FORCE_PREFIX}${clientId}`;
  const attempts = await cacheService.get<number>(key) || 0;
  await cacheService.set(key, attempts + 1, 3600);
};

/**
 * 重置失败尝试
 */
export const resetFailedAttempts = async (req: Request): Promise<void> => {
  const clientId = getClientId(req);
  const key = `${BRUTE_FORCE_PREFIX}${clientId}`;
  await cacheService.del(key);
};

/**
 * IP 黑名单检查中间件
 */
export const ipBlocklistMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = getClientId(req);
    const isBlocked = await cacheService.get<boolean>(`${BLOCKED_PREFIX}${ip}`);

    if (isBlocked) {
      logger.warn(`Blocked IP attempted access: ${ip}`);
      throw new ApiError(403, 'Access denied');
    }
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next();
    }
  }
};

/**
 * 封禁 IP
 */
export const blockIP = async (ip: string, duration: number = 86400): Promise<void> => {
  await cacheService.set(`${BLOCKED_PREFIX}ip:${ip}`, true, duration);
  logger.info(`IP blocked: ${ip} for ${duration}s`);
};

/**
 * 解封 IP
 */
export const unblockIP = async (ip: string): Promise<void> => {
  await cacheService.del(`${BLOCKED_PREFIX}ip:${ip}`);
  logger.info(`IP unblocked: ${ip}`);
};
