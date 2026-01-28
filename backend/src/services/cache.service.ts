import Redis from 'ioredis';

// Redis 配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// 缓存键前缀
export const CacheKeys = {
  STOCK_QUOTE: 'stock:quote:',
  STOCK_KLINE: 'stock:kline:',
  MARKET_SENTIMENT: 'market:sentiment',
  MARKET_SECTORS: 'market:sectors',
  NORTH_FLOW: 'market:north_flow',
  DRAGON_TIGER: 'market:dragon_tiger:',
  MONEY_FLOW: 'market:money_flow',
};

// 默认过期时间（秒）
export const CacheTTL = {
  QUOTE: 30,           // 行情 30 秒
  KLINE: 300,          // K线 5 分钟
  SENTIMENT: 60,       // 情绪 1 分钟
  SECTORS: 120,        // 板块 2 分钟
  NORTH_FLOW: 300,     // 北向资金 5 分钟
  DRAGON_TIGER: 3600,  // 龙虎榜 1 小时
  MONEY_FLOW: 60,      // 资金流向 1 分钟
};

class CacheService {
  private client: Redis | null = null;
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.connected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis error:', err.message);
        this.connected = false;
      });

      await this.client.ping();
      this.connected = true;
    } catch (error) {
      console.warn('Redis connection failed, using memory cache');
      this.client = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client) return;

    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, data);
      } else {
        await this.client.set(key, data);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.client) return;

    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const cacheService = new CacheService();
