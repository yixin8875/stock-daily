import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TradingPattern {
  // 交易时间分布
  weekdayDistribution: { day: string; count: number; winRate: number }[];
  // 持仓时间分析
  holdingTimeAnalysis: {
    shortTerm: { count: number; winRate: number; avgProfit: number };
    mediumTerm: { count: number; winRate: number; avgProfit: number };
    longTerm: { count: number; winRate: number; avgProfit: number };
  };
  // 交易频率
  tradingFrequency: {
    avgTradesPerWeek: number;
    avgTradesPerMonth: number;
    mostActiveDay: string;
    leastActiveDay: string;
  };
}

export interface BehaviorBias {
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string;
  suggestion: string;
}

export interface TradingHabit {
  category: string;
  metric: string;
  value: number;
  benchmark: number;
  status: 'good' | 'warning' | 'danger';
  comment: string;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

class BehaviorAnalysisService {
  async getTradingPatterns(userId: string): Promise<TradingPattern> {
    const diaries = await prisma.diary.findMany({
      where: { userId },
      select: { date: true, profitLossAmount: true },
      orderBy: { date: 'asc' },
    });

    // 星期分布
    const weekdayStats = new Map<number, { count: number; wins: number }>();
    for (let i = 0; i < 7; i++) {
      weekdayStats.set(i, { count: 0, wins: 0 });
    }

    for (const d of diaries) {
      if (d.profitLossAmount === null) continue;
      const day = d.date.getDay();
      const stats = weekdayStats.get(day)!;
      stats.count++;
      if (Number(d.profitLossAmount) > 0) stats.wins++;
    }

    const weekdayDistribution = Array.from(weekdayStats.entries())
      .filter(([_, s]) => s.count > 0)
      .map(([day, stats]) => ({
        day: WEEKDAYS[day],
        count: stats.count,
        winRate: stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0,
      }));

    // 交易频率
    const totalDays = diaries.length;
    const weeks = Math.max(1, totalDays / 5);
    const months = Math.max(1, totalDays / 22);

    const dayCounts = weekdayDistribution.filter(d => d.count > 0);
    const mostActive = dayCounts.sort((a, b) => b.count - a.count)[0];
    const leastActive = dayCounts.sort((a, b) => a.count - b.count)[0];

    return {
      weekdayDistribution,
      holdingTimeAnalysis: {
        shortTerm: { count: 0, winRate: 0, avgProfit: 0 },
        mediumTerm: { count: 0, winRate: 0, avgProfit: 0 },
        longTerm: { count: 0, winRate: 0, avgProfit: 0 },
      },
      tradingFrequency: {
        avgTradesPerWeek: Math.round((totalDays / weeks) * 10) / 10,
        avgTradesPerMonth: Math.round((totalDays / months) * 10) / 10,
        mostActiveDay: mostActive?.day || '无数据',
        leastActiveDay: leastActive?.day || '无数据',
      },
    };
  }

  async detectBehaviorBiases(userId: string): Promise<BehaviorBias[]> {
    const biases: BehaviorBias[] = [];

    const diaries = await prisma.diary.findMany({
      where: { userId },
      select: {
        profitLossAmount: true,
        profitLossPercent: true,
        emotionBefore: true,
      },
    });

    if (diaries.length < 10) return biases;

    // 分析盈亏数据
    const profits: number[] = [];
    const losses: number[] = [];

    for (const d of diaries) {
      if (d.profitLossAmount === null) continue;
      const amt = Number(d.profitLossAmount);
      if (amt > 0) profits.push(amt);
      else if (amt < 0) losses.push(Math.abs(amt));
    }

    // 1. 处置效应检测
    if (profits.length > 0 && losses.length > 0) {
      const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

      if (avgProfit < avgLoss * 0.8) {
        biases.push({
          name: '处置效应',
          description: '倾向于过早卖出盈利股票，过久持有亏损股票',
          severity: avgProfit < avgLoss * 0.5 ? 'high' : 'medium',
          evidence: `平均盈利${avgProfit.toFixed(0)}元 vs 平均亏损${avgLoss.toFixed(0)}元`,
          suggestion: '设置明确的止盈止损点，严格执行交易计划',
        });
      }
    }

    // 2. 过度交易检测
    const tradesPerMonth = diaries.length / Math.max(1, diaries.length / 22);
    if (tradesPerMonth > 15) {
      biases.push({
        name: '过度交易',
        description: '交易频率过高，可能导致手续费侵蚀利润',
        severity: tradesPerMonth > 25 ? 'high' : 'medium',
        evidence: `月均交易${tradesPerMonth.toFixed(1)}次`,
        suggestion: '减少交易频率，专注于高质量交易机会',
      });
    }

    // 3. 情绪化交易检测
    const emotionTrades = diaries.filter(d =>
      d.emotionBefore === 'EXCITED' || d.emotionBefore === 'GREEDY'
    );
    if (emotionTrades.length > diaries.length * 0.3) {
      biases.push({
        name: '情绪化交易',
        description: '在兴奋或贪婪情绪下交易比例过高',
        severity: 'medium',
        evidence: `${((emotionTrades.length / diaries.length) * 100).toFixed(0)}%的交易在高情绪状态下进行`,
        suggestion: '交易前进行情绪检查，避免冲动决策',
      });
    }

    return biases;
  }

  async getTradingHabits(userId: string): Promise<TradingHabit[]> {
    const habits: TradingHabit[] = [];

    const diaries = await prisma.diary.findMany({
      where: { userId },
      select: { profitLossAmount: true, profitLossPercent: true },
    });

    if (diaries.length === 0) return habits;

    // 胜率
    const wins = diaries.filter(d => d.profitLossAmount && Number(d.profitLossAmount) > 0).length;
    const winRate = (wins / diaries.length) * 100;

    habits.push({
      category: '交易表现',
      metric: '胜率',
      value: Math.round(winRate),
      benchmark: 50,
      status: winRate >= 50 ? 'good' : winRate >= 40 ? 'warning' : 'danger',
      comment: winRate >= 50 ? '胜率良好' : '需要提高选股准确性',
    });

    // 盈亏比
    const profits = diaries.filter(d => d.profitLossAmount && Number(d.profitLossAmount) > 0)
      .map(d => Number(d.profitLossAmount));
    const losses = diaries.filter(d => d.profitLossAmount && Number(d.profitLossAmount) < 0)
      .map(d => Math.abs(Number(d.profitLossAmount)));

    if (profits.length > 0 && losses.length > 0) {
      const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
      const ratio = avgLoss > 0 ? avgProfit / avgLoss : 0;

      habits.push({
        category: '风险管理',
        metric: '盈亏比',
        value: Math.round(ratio * 100) / 100,
        benchmark: 1.5,
        status: ratio >= 1.5 ? 'good' : ratio >= 1 ? 'warning' : 'danger',
        comment: ratio >= 1.5 ? '盈亏比健康' : '需要改善止盈止损策略',
      });
    }

    return habits;
  }
}

export const behaviorAnalysisService = new BehaviorAnalysisService();
