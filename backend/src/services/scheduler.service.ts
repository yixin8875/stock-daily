import * as cron from 'node-cron';
import { MarketService } from './market.service';
import { cacheService, CacheKeys, CacheTTL } from './cache.service';

export interface ScheduledTask {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private taskConfigs: Map<string, ScheduledTask> = new Map();

  async init(): Promise<void> {
    await cacheService.connect();
    this.registerTasks();
    console.log('Scheduler service initialized');
  }

  private registerTasks(): void {
    // 交易日 9:30-15:00 每分钟更新行情
    this.addTask('updateMarketData', '*/1 9-15 * * 1-5', async () => {
      await this.updateMarketData();
    });

    // 每天 15:30 更新龙虎榜
    this.addTask('updateDragonTiger', '30 15 * * 1-5', async () => {
      await this.updateDragonTiger();
    });

    // 每天 9:00 清理过期缓存
    this.addTask('cleanupCache', '0 9 * * *', async () => {
      await this.cleanupCache();
    });
  }

  private addTask(name: string, schedule: string, handler: () => Promise<void>): void {
    const task = cron.schedule(schedule, async () => {
      try {
        console.log(`[Scheduler] Running task: ${name}`);
        await handler();
        this.updateTaskStatus(name);
      } catch (error) {
        console.error(`[Scheduler] Task ${name} failed:`, error);
      }
    });

    this.tasks.set(name, task);
    this.taskConfigs.set(name, {
      name,
      schedule,
      enabled: false,
    });
  }

  private updateTaskStatus(name: string): void {
    const config = this.taskConfigs.get(name);
    if (config) {
      config.lastRun = new Date();
    }
  }

  async updateMarketData(): Promise<void> {
    const [sentiment, sectors] = await Promise.all([
      MarketService.getMarketSentiment(),
      MarketService.getSectors(),
    ]);

    if (sentiment) {
      await cacheService.set(CacheKeys.MARKET_SENTIMENT, sentiment, CacheTTL.SENTIMENT);
    }
    if (sectors.length > 0) {
      await cacheService.set(CacheKeys.MARKET_SECTORS, sectors, CacheTTL.SECTORS);
    }
  }

  async updateDragonTiger(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const data = await MarketService.getDragonTiger();
    await cacheService.set(CacheKeys.DRAGON_TIGER + today, data, CacheTTL.DRAGON_TIGER);
  }

  async cleanupCache(): Promise<void> {
    console.log('[Scheduler] Cache cleanup completed');
  }

  startAll(): void {
    this.tasks.forEach((task, name) => {
      task.start();
      const config = this.taskConfigs.get(name);
      if (config) config.enabled = true;
    });
    console.log('[Scheduler] All tasks started');
  }

  stopAll(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      const config = this.taskConfigs.get(name);
      if (config) config.enabled = false;
    });
  }

  getTaskList(): ScheduledTask[] {
    return Array.from(this.taskConfigs.values());
  }
}

export const schedulerService = new SchedulerService();
