// 资金曲线分析服务
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EquityPoint {
  date: string;
  equity: number;
  dailyReturn: number;
  drawdown: number;
}

interface EquityAnalysis {
  curve: EquityPoint[];
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
}

class EquityCurveService {
  // 生成资金曲线
  async generateEquityCurve(userId: string, days: number = 30): Promise<EquityAnalysis> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
      include: { trades: true },
      orderBy: { date: 'asc' },
    });

    // 按日期分组计算每日盈亏
    const dailyPnL = new Map<string, number>();
    for (const diary of diaries) {
      const date = diary.date.toISOString().split('T')[0];
      let pnl = 0;
      for (const trade of diary.trades) {
        if (trade.direction === 'SELL') {
          pnl += Number(trade.amount) * 0.02;
        }
      }
      dailyPnL.set(date, (dailyPnL.get(date) || 0) + pnl);
    }

    // 构建资金曲线
    const initialEquity = 100000; // 假设初始资金
    let equity = initialEquity;
    let maxEquity = equity;
    const curve: EquityPoint[] = [];
    const returns: number[] = [];

    const sortedDates = Array.from(dailyPnL.keys()).sort();
    for (const date of sortedDates) {
      const pnl = dailyPnL.get(date) || 0;
      const prevEquity = equity;
      equity += pnl;
      maxEquity = Math.max(maxEquity, equity);

      const dailyReturn = prevEquity > 0 ? (pnl / prevEquity) * 100 : 0;
      const drawdown = maxEquity > 0 ? ((maxEquity - equity) / maxEquity) * 100 : 0;

      returns.push(dailyReturn);
      curve.push({ date, equity, dailyReturn, drawdown });
    }

    // 计算统计指标
    const totalReturn = initialEquity > 0
      ? ((equity - initialEquity) / initialEquity) * 100
      : 0;
    const maxDrawdown = Math.max(...curve.map(c => c.drawdown), 0);
    const sharpeRatio = this.calcSharpeRatio(returns);
    const { winRate, profitFactor } = this.calcWinMetrics(returns);

    return { curve, totalReturn, maxDrawdown, sharpeRatio, winRate, profitFactor };
  }

  private calcSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length
    );
    return std > 0 ? (avg / std) * Math.sqrt(252) : 0;
  }

  private calcWinMetrics(returns: number[]): { winRate: number; profitFactor: number } {
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const winRate = returns.length > 0 ? (wins.length / returns.length) * 100 : 0;
    const totalWin = wins.reduce((a, b) => a + b, 0);
    const totalLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
    const profitFactor = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? 999 : 0;
    return { winRate, profitFactor };
  }
}

export const equityCurveService = new EquityCurveService();
