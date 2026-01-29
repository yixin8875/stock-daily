import * as cron from 'node-cron';
import { MarketService } from './market.service';
import { cacheService, CacheKeys, CacheTTL } from './cache.service';
import { dataCleanupService } from './dataCleanup.service';

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

    // 每天 17:00 更新北向资金
    this.addTask('updateNorthFlow', '0 17 * * 1-5', async () => {
      await this.updateNorthFlow();
    });

    // 每天 9:00 清理过期缓存
    this.addTask('cleanupCache', '0 9 * * *', async () => {
      await this.cleanupCache();
    });

    // 每天 3:00 执行数据清洗
    this.addTask('dataCleanup', '0 3 * * *', async () => {
      await this.runDataCleanup();
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

  async updateNorthFlow(): Promise<void> {
    const data = await MarketService.getNorthFlow();
    await cacheService.set(CacheKeys.NORTH_FLOW + ':10', data, CacheTTL.NORTH_FLOW);
  }

  async cleanupCache(): Promise<void> {
    console.log('[Scheduler] Cache cleanup completed');
  }

  async runDataCleanup(): Promise<void> {
    const result = await dataCleanupService.runAll();
    console.log(`[Scheduler] Data cleanup: signals=${result.signals}, alerts=${result.alerts}, orphans=${result.orphans}`);
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
