import { prisma } from '../app';

export interface TodayReminder {
  buyPlans: Array<{
    id: string;
    stockCode: string;
    stockName: string;
    targetPrice: number;
    positionPercent: number;
    buyReason: string | null;
    triggerCondition: string | null;
  }>;
  sellPlans: Array<{
    id: string;
    stockCode: string;
    stockName: string;
    targetPrice: number;
    sellPercent: number;
    sellReason: string | null;
    triggerCondition: string | null;
  }>;
  stopLosses: Array<{
    id: string;
    stockCode: string;
    stockName: string;
    stopPrice: number;
    costPrice: number | null;
    stopReason: string | null;
  }>;
  watchStocks: Array<{
    id: string;
    stockCode: string;
    stockName: string;
    watchReason: string | null;
    watchLevel: string;
    techPosition: string | null;
  }>;
  summary: {
    totalBuyPlans: number;
    totalSellPlans: number;
    totalStopLosses: number;
    totalWatchStocks: number;
  };
}

export class ReminderService {
  /**
   * 获取今日提醒（昨日制定的计划）
   */
  static async getTodayReminders(userId: string): Promise<TodayReminder> {
    // 获取昨天的日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // 查找昨天的日记
    const yesterdayDiary = await prisma.diary.findFirst({
      where: {
        userId,
        date: {
          gte: yesterday,
          lte: yesterdayEnd,
        },
      },
      include: {
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
        watchStocks: true,
      },
    });

    if (!yesterdayDiary) {
      return {
        buyPlans: [],
        sellPlans: [],
        stopLosses: [],
        watchStocks: [],
        summary: {
          totalBuyPlans: 0,
          totalSellPlans: 0,
          totalStopLosses: 0,
          totalWatchStocks: 0,
        },
      };
    }

    const buyPlans = yesterdayDiary.buyPlans.map(p => ({
      id: p.id,
      stockCode: p.stockCode,
      stockName: p.stockName,
      targetPrice: Number(p.targetPrice),
      positionPercent: Number(p.positionPercent),
      buyReason: p.buyReason,
      triggerCondition: p.triggerCondition,
    }));

    const sellPlans = yesterdayDiary.sellPlans.map(p => ({
      id: p.id,
      stockCode: p.stockCode,
      stockName: p.stockName,
      targetPrice: Number(p.targetPrice),
      sellPercent: Number(p.sellPercent),
      sellReason: p.sellReason,
      triggerCondition: p.triggerCondition,
    }));

    const stopLosses = yesterdayDiary.stopLosses.map(s => ({
      id: s.id,
      stockCode: s.stockCode,
      stockName: s.stockName,
      stopPrice: Number(s.stopPrice),
      costPrice: s.costPrice ? Number(s.costPrice) : null,
      stopReason: s.stopReason,
    }));

    const watchStocks = yesterdayDiary.watchStocks.map(w => ({
      id: w.id,
      stockCode: w.stockCode,
      stockName: w.stockName,
      watchReason: w.watchReason,
      watchLevel: w.watchLevel,
      techPosition: w.techPosition,
    }));

    return {
      buyPlans,
      sellPlans,
      stopLosses,
      watchStocks,
      summary: {
        totalBuyPlans: buyPlans.length,
        totalSellPlans: sellPlans.length,
        totalStopLosses: stopLosses.length,
        totalWatchStocks: watchStocks.length,
      },
    };
  }

  /**
   * 获取所有未完成的计划（最近7天）
   */
  static async getPendingPlans(userId: string): Promise<{
    buyPlans: Array<{ date: string; plans: TodayReminder['buyPlans'] }>;
    sellPlans: Array<{ date: string; plans: TodayReminder['sellPlans'] }>;
    stopLosses: Array<{ date: string; plans: TodayReminder['stopLosses'] }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: weekAgo,
          lt: today,
        },
      },
      include: {
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
      },
      orderBy: { date: 'desc' },
    });

    const buyPlans = diaries
      .filter(d => d.buyPlans.length > 0)
      .map(d => ({
        date: d.date.toISOString().split('T')[0],
        plans: d.buyPlans.map(p => ({
          id: p.id,
          stockCode: p.stockCode,
          stockName: p.stockName,
          targetPrice: Number(p.targetPrice),
          positionPercent: Number(p.positionPercent),
          buyReason: p.buyReason,
          triggerCondition: p.triggerCondition,
        })),
      }));

    const sellPlans = diaries
      .filter(d => d.sellPlans.length > 0)
      .map(d => ({
        date: d.date.toISOString().split('T')[0],
        plans: d.sellPlans.map(p => ({
          id: p.id,
          stockCode: p.stockCode,
          stockName: p.stockName,
          targetPrice: Number(p.targetPrice),
          sellPercent: Number(p.sellPercent),
          sellReason: p.sellReason,
          triggerCondition: p.triggerCondition,
        })),
      }));

    const stopLosses = diaries
      .filter(d => d.stopLosses.length > 0)
      .map(d => ({
        date: d.date.toISOString().split('T')[0],
        plans: d.stopLosses.map(s => ({
          id: s.id,
          stockCode: s.stockCode,
          stockName: s.stockName,
          stopPrice: Number(s.stopPrice),
          costPrice: s.costPrice ? Number(s.costPrice) : null,
          stopReason: s.stopReason,
        })),
      }));

    return { buyPlans, sellPlans, stopLosses };
  }
}
