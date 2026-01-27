import { prisma } from '../app';
import { Decimal } from '@prisma/client/runtime/library';

export interface StatisticsSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  profitLossRatio: number;
  netProfit: number;
  averageProfit: number;
  averageLoss: number;
  maxProfit: number;
  maxLoss: number;
}

export interface ProfitDataPoint {
  date: string;
  profit: number;
  cumulativeProfit: number;
}

export interface TradeStatistics {
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  tradingDays: number;
  averageTradesPerDay: number;
  mostTradedStocks: Array<{
    stockCode: string;
    stockName: string;
    count: number;
  }>;
  profitDistribution: {
    bigWin: number;    // > 5%
    smallWin: number;  // 0-5%
    smallLoss: number; // 0-5%
    bigLoss: number;   // > 5%
  };
}

export interface WinRateTrendPoint {
  date: string;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
}

export interface EmotionProfitData {
  emotion: string;
  emotionLabel: string;
  totalDays: number;
  winningDays: number;
  losingDays: number;
  winRate: number;
  avgProfit: number;
  totalProfit: number;
}

export class StatisticsService {
  static async getSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<StatisticsSummary> {
    const whereClause: any = {
      diary: { userId },
    };

    if (startDate || endDate) {
      whereClause.diary.date = {};
      if (startDate) {
        whereClause.diary.date.gte = startDate;
      }
      if (endDate) {
        whereClause.diary.date.lte = endDate;
      }
    }

    // Get all diaries with profit/loss data
    const diaryWhereClause: any = { userId };
    if (startDate || endDate) {
      diaryWhereClause.date = {};
      if (startDate) {
        diaryWhereClause.date.gte = startDate;
      }
      if (endDate) {
        diaryWhereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: diaryWhereClause,
      select: {
        profitLossAmount: true,
        profitLossPercent: true,
      },
    });

    // Calculate statistics from diary profit/loss data
    let totalTrades = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let maxProfit = 0;
    let maxLoss = 0;

    for (const diary of diaries) {
      if (diary.profitLossAmount !== null) {
        const amount = Number(diary.profitLossAmount);
        totalTrades++;

        if (amount > 0) {
          winningTrades++;
          totalProfit += amount;
          if (amount > maxProfit) maxProfit = amount;
        } else if (amount < 0) {
          losingTrades++;
          totalLoss += Math.abs(amount);
          if (Math.abs(amount) > maxLoss) maxLoss = Math.abs(amount);
        }
      }
    }

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const averageProfit = winningTrades > 0 ? totalProfit / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
    const profitLossRatio = averageLoss > 0 ? averageProfit / averageLoss : 0;
    const netProfit = totalProfit - totalLoss;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalLoss: Math.round(totalLoss * 100) / 100,
      profitLossRatio: Math.round(profitLossRatio * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      averageProfit: Math.round(averageProfit * 100) / 100,
      averageLoss: Math.round(averageLoss * 100) / 100,
      maxProfit: Math.round(maxProfit * 100) / 100,
      maxLoss: Math.round(maxLoss * 100) / 100,
    };
  }

  static async getProfitCurve(
    userId: string,
    period: 'day' | 'week' | 'month' = 'day',
    startDate?: Date,
    endDate?: Date
  ): Promise<ProfitDataPoint[]> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: {
        date: true,
        profitLossAmount: true,
      },
      orderBy: { date: 'asc' },
    });

    const dataPoints: ProfitDataPoint[] = [];
    let cumulativeProfit = 0;

    if (period === 'day') {
      for (const diary of diaries) {
        const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;
        cumulativeProfit += profit;

        dataPoints.push({
          date: diary.date.toISOString().split('T')[0],
          profit: Math.round(profit * 100) / 100,
          cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
        });
      }
    } else {
      // Group by week or month
      const grouped = new Map<string, number>();

      for (const diary of diaries) {
        let key: string;
        const date = diary.date;

        if (period === 'week') {
          // Get ISO week
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + 4 - (d.getDay() || 7));
          const yearStart = new Date(d.getFullYear(), 0, 1);
          const weekNo = Math.ceil(
            ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
          );
          key = `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
        } else {
          // Month
          key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
        }

        const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;
        grouped.set(key, (grouped.get(key) || 0) + profit);
      }

      for (const [date, profit] of grouped) {
        cumulativeProfit += profit;
        dataPoints.push({
          date,
          profit: Math.round(profit * 100) / 100,
          cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
        });
      }
    }

    return dataPoints;
  }

  static async getMonthlyProfit(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ month: string; profit: number; profitRate: number }>> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: {
        date: true,
        profitLossAmount: true,
        profitLossPercent: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData = new Map<string, { profit: number; profitRate: number; count: number }>();

    for (const diary of diaries) {
      const month = `${diary.date.getFullYear()}-${(diary.date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;
      const profitRate = diary.profitLossPercent ? Number(diary.profitLossPercent) : 0;

      const existing = monthlyData.get(month);
      if (existing) {
        existing.profit += profit;
        existing.profitRate += profitRate;
        existing.count++;
      } else {
        monthlyData.set(month, { profit, profitRate, count: 1 });
      }
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      profit: Math.round(data.profit * 100) / 100,
      profitRate: Math.round(data.profitRate * 100) / 100,
    }));
  }

  static async getTradeStatistics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TradeStatistics> {
    const whereClause: any = {
      diary: { userId },
    };

    if (startDate || endDate) {
      whereClause.diary.date = {};
      if (startDate) {
        whereClause.diary.date.gte = startDate;
      }
      if (endDate) {
        whereClause.diary.date.lte = endDate;
      }
    }

    // Get all trades
    const trades = await prisma.trade.findMany({
      where: whereClause,
      include: {
        diary: {
          select: {
            date: true,
            profitLossPercent: true,
          },
        },
      },
    });

    const totalTrades = trades.length;
    const buyTrades = trades.filter((t) => t.direction === 'BUY').length;
    const sellTrades = trades.filter((t) => t.direction === 'SELL').length;

    // Count unique trading days
    const tradingDays = new Set(
      trades.map((t) => t.diary.date.toISOString().split('T')[0])
    ).size;

    const averageTradesPerDay =
      tradingDays > 0 ? Math.round((totalTrades / tradingDays) * 100) / 100 : 0;

    // Most traded stocks
    const stockCounts = new Map<string, { name: string; count: number }>();
    for (const trade of trades) {
      const existing = stockCounts.get(trade.stockCode);
      if (existing) {
        existing.count++;
      } else {
        stockCounts.set(trade.stockCode, {
          name: trade.stockName,
          count: 1,
        });
      }
    }

    const mostTradedStocks = Array.from(stockCounts.entries())
      .map(([code, data]) => ({
        stockCode: code,
        stockName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Profit distribution from diary data
    const diaryWhereClause: any = { userId };
    if (startDate || endDate) {
      diaryWhereClause.date = {};
      if (startDate) {
        diaryWhereClause.date.gte = startDate;
      }
      if (endDate) {
        diaryWhereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: diaryWhereClause,
      select: {
        profitLossPercent: true,
      },
    });

    const profitDistribution = {
      bigWin: 0,
      smallWin: 0,
      smallLoss: 0,
      bigLoss: 0,
    };

    for (const diary of diaries) {
      if (diary.profitLossPercent !== null) {
        const percent = Number(diary.profitLossPercent);
        if (percent > 5) {
          profitDistribution.bigWin++;
        } else if (percent > 0) {
          profitDistribution.smallWin++;
        } else if (percent >= -5) {
          profitDistribution.smallLoss++;
        } else {
          profitDistribution.bigLoss++;
        }
      }
    }

    return {
      totalTrades,
      buyTrades,
      sellTrades,
      tradingDays,
      averageTradesPerDay,
      mostTradedStocks,
      profitDistribution,
    };
  }

  static async getWinRateTrend(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WinRateTrendPoint[]> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: {
        date: true,
        profitLossAmount: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month and calculate win rate
    const monthlyData = new Map<string, { wins: number; total: number }>();

    for (const diary of diaries) {
      if (diary.profitLossAmount !== null) {
        const month = `${diary.date.getFullYear()}-${(diary.date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
        const amount = Number(diary.profitLossAmount);

        const existing = monthlyData.get(month);
        if (existing) {
          existing.total++;
          if (amount > 0) existing.wins++;
        } else {
          monthlyData.set(month, {
            wins: amount > 0 ? 1 : 0,
            total: 1,
          });
        }
      }
    }

    return Array.from(monthlyData.entries()).map(([date, data]) => ({
      date,
      winRate: Math.round((data.wins / data.total) * 100 * 100) / 100,
      totalTrades: data.total,
      winningTrades: data.wins,
    }));
  }

  static async getEmotionProfitAnalysis(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<EmotionProfitData[]> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: {
        emotionBefore: true,
        profitLossAmount: true,
      },
    });

    const emotionLabels: Record<string, string> = {
      EXCITED: '兴奋',
      CALM: '平静',
      ANXIOUS: '焦虑',
      FEARFUL: '恐惧',
      GREEDY: '贪婪',
    };

    const emotionData = new Map<string, {
      totalDays: number;
      winningDays: number;
      losingDays: number;
      totalProfit: number;
    }>();

    for (const diary of diaries) {
      if (diary.emotionBefore && diary.profitLossAmount !== null) {
        const emotion = diary.emotionBefore;
        const profit = Number(diary.profitLossAmount);

        const existing = emotionData.get(emotion);
        if (existing) {
          existing.totalDays++;
          existing.totalProfit += profit;
          if (profit > 0) existing.winningDays++;
          else if (profit < 0) existing.losingDays++;
        } else {
          emotionData.set(emotion, {
            totalDays: 1,
            winningDays: profit > 0 ? 1 : 0,
            losingDays: profit < 0 ? 1 : 0,
            totalProfit: profit,
          });
        }
      }
    }

    return Array.from(emotionData.entries()).map(([emotion, data]) => ({
      emotion,
      emotionLabel: emotionLabels[emotion] || emotion,
      totalDays: data.totalDays,
      winningDays: data.winningDays,
      losingDays: data.losingDays,
      winRate: Math.round((data.winningDays / data.totalDays) * 100 * 100) / 100,
      avgProfit: Math.round((data.totalProfit / data.totalDays) * 100) / 100,
      totalProfit: Math.round(data.totalProfit * 100) / 100,
    }));
  }
}
