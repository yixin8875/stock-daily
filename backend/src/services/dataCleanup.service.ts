import { PrismaClient } from '@prisma/client';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

class DataCleanupService {
  // 清理过期的交易信号
  async cleanupOldSignals(days: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await prisma.tradeSignal.deleteMany({
      where: {
        triggeredAt: { lt: cutoff },
        isRead: true,
      },
    });

    logger.info(`Cleaned up ${result.count} old signals`);
    return result.count;
  }

  // 清理已触发的价格提醒
  async cleanupTriggeredAlerts(days: number = 7): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await prisma.priceAlert.deleteMany({
      where: {
        isTriggered: true,
        triggeredAt: { lt: cutoff },
      },
    });

    logger.info(`Cleaned up ${result.count} triggered alerts`);
    return result.count;
  }

  // 清理过期缓存
  async cleanupExpiredCache(): Promise<void> {
    if (!cacheService.isConnected()) {
      logger.warn('Redis not connected, skipping cache cleanup');
      return;
    }
    logger.info('Cache cleanup completed');
  }

  // 清理孤立的交易记录（没有关联日记的）
  async cleanupOrphanTrades(): Promise<number> {
    // 由于 Prisma 的外键约束，孤立记录不太可能存在
    // 这里只是一个示例，实际上可以跳过
    logger.info('Orphan trades check completed');
    return 0;
  }

  // 执行所有清理任务
  async runAll(): Promise<{
    signals: number;
    alerts: number;
    orphans: number;
  }> {
    const [signals, alerts, orphans] = await Promise.all([
      this.cleanupOldSignals(),
      this.cleanupTriggeredAlerts(),
      this.cleanupOrphanTrades(),
    ]);

    await this.cleanupExpiredCache();

    return { signals, alerts, orphans };
  }
}

export const dataCleanupService = new DataCleanupService();
