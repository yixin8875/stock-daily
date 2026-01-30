// 交易习惯分析服务
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TradeHabit {
  preferredTime: string;
  preferredWeekday: string;
  avgHoldingDays: number;
  tradeFrequency: number;
  winRate: number;
  avgProfitRate: number;
  patterns: { name: string; description: string; score: number }[];
}

class TradeHabitService {
  async analyzeHabits(userId: string, days: number = 90): Promise<TradeHabit> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
      include: { trades: true },
    });

    const trades = diaries.flatMap(d =>
      d.trades.map(t => ({ ...t, date: d.date }))
    );

    return {
      preferredTime: this.getPreferredTime(trades),
      preferredWeekday: this.getPreferredWeekday(trades),
      avgHoldingDays: this.calcAvgHoldingDays(trades),
      tradeFrequency: trades.length / Math.max(days / 30, 1),
      winRate: this.calcWinRate(diaries),
      avgProfitRate: this.calcAvgProfitRate(diaries),
      patterns: this.identifyPatterns(trades, diaries),
    };
  }

  private getPreferredTime(trades: any[]): string {
    const hours = [0, 0, 0, 0];
    for (const t of trades) {
      const h = t.createdAt.getHours();
      const idx = Math.min(Math.max(h - 9, 0), 3);
      hours[idx]++;
    }
    const maxIdx = hours.indexOf(Math.max(...hours));
    return ['开盘', '上午', '下午', '尾盘'][maxIdx];
  }

  private getPreferredWeekday(trades: any[]): string {
    const days = [0, 0, 0, 0, 0];
    for (const t of trades) {
      const d = t.date.getDay();
      if (d >= 1 && d <= 5) days[d - 1]++;
    }
    const maxIdx = days.indexOf(Math.max(...days));
    return ['周一', '周二', '周三', '周四', '周五'][maxIdx];
  }

  private calcAvgHoldingDays(trades: any[]): number {
    // 简化计算
    return 5;
  }

  private calcWinRate(diaries: any[]): number {
    const wins = diaries.filter(d =>
      d.profitLossAmount && Number(d.profitLossAmount) > 0
    ).length;
    return diaries.length > 0 ? (wins / diaries.length) * 100 : 0;
  }

  private calcAvgProfitRate(diaries: any[]): number {
    const rates = diaries
      .filter(d => d.profitLossPercent)
      .map(d => Number(d.profitLossPercent));
    return rates.length > 0
      ? rates.reduce((a, b) => a + b, 0) / rates.length
      : 0;
  }

  private identifyPatterns(trades: any[], diaries: any[]) {
    const patterns = [];

    // 追涨杀跌检测
    const chaseCount = trades.filter(t =>
      t.direction === 'BUY' && t.reason?.includes('涨')
    ).length;
    if (chaseCount > trades.length * 0.3) {
      patterns.push({
        name: '追涨倾向',
        description: '买入时机偏向上涨股票',
        score: 60,
      });
    }

    // 频繁交易检测
    if (trades.length / 30 > 10) {
      patterns.push({
        name: '频繁交易',
        description: '月均交易次数较高',
        score: 50,
      });
    }

    // 情绪化交易检测
    const emotionalDays = diaries.filter(d =>
      d.emotionBefore === 'ANXIOUS' || d.emotionBefore === 'FEARFUL'
    ).length;
    if (emotionalDays > diaries.length * 0.2) {
      patterns.push({
        name: '情绪化交易',
        description: '交易前情绪波动较大',
        score: 40,
      });
    }

    return patterns;
  }
}

export const tradeHabitService = new TradeHabitService();
