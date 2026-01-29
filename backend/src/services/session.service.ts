import { cacheService } from './cache.service';

// 会话相关的缓存键
const SESSION_PREFIX = 'session:';
const BLACKLIST_PREFIX = 'blacklist:';
const USER_SESSIONS_PREFIX = 'user_sessions:';

// 默认会话过期时间（7天，单位秒）
const SESSION_TTL = 7 * 24 * 60 * 60;

export class SessionService {
  /**
   * 创建会话
   */
  static async createSession(userId: string, token: string, deviceInfo?: string): Promise<void> {
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;

    const sessionData = {
      userId,
      deviceInfo: deviceInfo || 'unknown',
      createdAt: new Date().toISOString(),
    };

    // 存储会话
    await cacheService.set(sessionKey, sessionData, SESSION_TTL);

    // 将 token 添加到用户的会话列表
    const userSessions = await cacheService.get<string[]>(userSessionsKey) || [];
    userSessions.push(token);
    await cacheService.set(userSessionsKey, userSessions, SESSION_TTL);
  }

  /**
   * 验证会话是否有效
   */
  static async isValidSession(token: string): Promise<boolean> {
    // 检查是否在黑名单中
    const isBlacklisted = await cacheService.get(`${BLACKLIST_PREFIX}${token}`);
    if (isBlacklisted) {
      return false;
    }

    // 检查会话是否存在
    const session = await cacheService.get(`${SESSION_PREFIX}${token}`);
    return !!session;
  }

  /**
   * 使单个会话失效（登出）
   */
  static async invalidateSession(token: string): Promise<void> {
    // 添加到黑名单
    await cacheService.set(`${BLACKLIST_PREFIX}${token}`, true, SESSION_TTL);
    // 删除会话
    await cacheService.del(`${SESSION_PREFIX}${token}`);
  }

  /**
   * 使用户所有会话失效（强制登出所有设备）
   */
  static async invalidateAllSessions(userId: string): Promise<void> {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const tokens = await cacheService.get<string[]>(userSessionsKey) || [];

    // 将所有 token 加入黑名单
    for (const token of tokens) {
      await cacheService.set(`${BLACKLIST_PREFIX}${token}`, true, SESSION_TTL);
      await cacheService.del(`${SESSION_PREFIX}${token}`);
    }

    // 清空用户会话列表
    await cacheService.del(userSessionsKey);
  }

  /**
   * 获取用户活跃会话数
   */
  static async getActiveSessionCount(userId: string): Promise<number> {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const tokens = await cacheService.get<string[]>(userSessionsKey) || [];
    return tokens.length;
  }
}
