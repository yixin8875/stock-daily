import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardMetrics {
  // 核心指标
  totalTrades: number;
  winRate: number;
  profitLossRatio: number;
  netProfit: number;
  // 最大回撤
  maxDrawdown: number;
  maxDrawdownPercent: number;
  // 连续统计
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  // 期望值
  expectancy: number;
  // 夏普比率（简化版）
  sharpeRatio: number;
  // 平均持仓天数
  avgHoldingDays: number;
}

export interface DrawdownPoint {
  date: string;
  equity: number;
  drawdown: number;
  drawdownPercent: number;
}

export interface StreakData {
  type: 'win' | 'loss';
  count: number;
  startDate: string;
  endDate: string;
  totalProfit: number;
}

class TradingDashboardService {
  async getMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<DashboardMetrics> {
    const whereClause: any = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: {
        date: true,
        profitLossAmount: true,
        profitLossPercent: true,
        totalAssets: true,
      },
      orderBy: { date: 'asc' },
    });

    let totalTrades = 0;
    let wins = 0;
    let losses = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    // 连续统计
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    // 回撤计算
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let equity = 0;

    // 收益率数组（用于夏普比率）
    const returns: number[] = [];

    for (const diary of diaries) {
      if (diary.profitLossAmount !== null) {
        const amount = Number(diary.profitLossAmount);
        const percent = diary.profitLossPercent ? Number(diary.profitLossPercent) : 0;
        totalTrades++;
        equity += amount;
        returns.push(percent);

        if (amount > 0) {
          wins++;
          totalProfit += amount;
          currentWinStreak++;
          currentLossStreak = 0;
          maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
        } else if (amount < 0) {
          losses++;
          totalLoss += Math.abs(amount);
          currentLossStreak++;
          currentWinStreak = 0;
          maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
        }

        // 更新峰值和回撤
        if (equity > peak) {
          peak = equity;
        }
        const drawdown = peak - equity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
        }
      }
    }

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const avgWin = wins > 0 ? totalProfit / wins : 0;
    const avgLoss = losses > 0 ? totalLoss / losses : 0;
    const profitLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    const netProfit = totalProfit - totalLoss;

    // 期望值 = (胜率 * 平均盈利) - (败率 * 平均亏损)
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

    // 简化夏普比率
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 1
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
      : 0;
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    // 当前连续状态
    let currentStreak = 0;
    let currentStreakType: 'win' | 'loss' | 'none' = 'none';
    if (currentWinStreak > 0) {
      currentStreak = currentWinStreak;
      currentStreakType = 'win';
    } else if (currentLossStreak > 0) {
      currentStreak = currentLossStreak;
      currentStreakType = 'loss';
    }

    return {
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      profitLossRatio: Math.round(profitLossRatio * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      currentStreak,
      currentStreakType,
      expectancy: Math.round(expectancy * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      avgHoldingDays: 0, // 需要持仓数据计算
    };
  }

  async getDrawdownCurve(userId: string, startDate?: Date, endDate?: Date): Promise<DrawdownPoint[]> {
    const whereClause: any = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      select: { date: true, profitLossAmount: true },
      orderBy: { date: 'asc' },
    });

    const points: DrawdownPoint[] = [];
    let equity = 0;
    let peak = 0;

    for (const diary of diaries) {
      const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;
      equity += profit;
      if (equity > peak) peak = equity;
      const drawdown = peak - equity;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      points.push({
        date: diary.date.toISOString().split('T')[0],
        equity: Math.round(equity * 100) / 100,
        drawdown: Math.round(drawdown * 100) / 100,
        drawdownPercent: Math.round(drawdownPercent * 100) / 100,
      });
    }

    return points;
  }

  async getStreakHistory(userId: string): Promise<StreakData[]> {
    const diaries = await prisma.diary.findMany({
      where: { userId },
      select: { date: true, profitLossAmount: true },
      orderBy: { date: 'asc' },
    });

    const streaks: StreakData[] = [];
    let currentStreak: StreakData | null = null;

    for (const diary of diaries) {
      if (diary.profitLossAmount === null) continue;
      const amount = Number(diary.profitLossAmount);
      const dateStr = diary.date.toISOString().split('T')[0];
      const type: 'win' | 'loss' = amount >= 0 ? 'win' : 'loss';

      if (!currentStreak || currentStreak.type !== type) {
        if (currentStreak && currentStreak.count >= 3) {
          streaks.push(currentStreak);
        }
        currentStreak = {
          type,
          count: 1,
          startDate: dateStr,
          endDate: dateStr,
          totalProfit: amount,
        };
      } else {
        currentStreak.count++;
        currentStreak.endDate = dateStr;
        currentStreak.totalProfit += amount;
      }
    }

    if (currentStreak && currentStreak.count >= 3) {
      streaks.push(currentStreak);
    }

    return streaks.map(s => ({
      ...s,
      totalProfit: Math.round(s.totalProfit * 100) / 100,
    }));
  }
}

export const tradingDashboardService = new TradingDashboardService();
