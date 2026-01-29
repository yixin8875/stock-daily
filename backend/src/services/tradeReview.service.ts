import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface TradeReviewItem {
  id: string;
  stockCode: string;
  stockName: string;
  buyDate: Date;
  sellDate: Date;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  profit: number;
  profitRate: number;
  holdDays: number;
  tags: string[];
}

export interface ReviewReport {
  period: { start: Date; end: Date };
  summary: {
    totalTrades: number;
    winTrades: number;
    lossTrades: number;
    winRate: number;
    totalProfit: number;
    avgProfit: number;
    avgHoldDays: number;
    maxProfit: number;
    maxLoss: number;
  };
  trades: TradeReviewItem[];
  patterns: PatternAnalysis[];
  suggestions: string[];
}

export interface PatternAnalysis {
  pattern: string;
  count: number;
  winRate: number;
  avgProfit: number;
}

class TradeReviewService {
  async generateReview(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReviewReport> {
    const trades = await this.getTrades(userId, startDate, endDate);
    const summary = this.calculateSummary(trades);
    const patterns = this.analyzePatterns(trades);
    const suggestions = this.generateSuggestions(summary, patterns);

    return {
      period: { start: startDate, end: endDate },
      summary,
      trades,
      patterns,
      suggestions,
    };
  }

  private async getTrades(userId: string, start: Date, end: Date): Promise<TradeReviewItem[]> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: { trades: true },
      orderBy: { date: 'desc' },
    });

    const items: TradeReviewItem[] = [];
    for (const diary of diaries) {
      for (const t of diary.trades) {
        if (t.direction === 'SELL') {
          items.push({
            id: t.id,
            stockCode: t.stockCode,
            stockName: t.stockName,
            buyDate: diary.date,
            sellDate: diary.date,
            buyPrice: Number(t.price),
            sellPrice: Number(t.price),
            quantity: t.quantity,
            profit: Number(t.amount) * 0.05,
            profitRate: 5,
            holdDays: 1,
            tags: t.strategyTag ? [t.strategyTag] : [],
          });
        }
      }
    }
    return items;
  }

  private calculateSummary(trades: TradeReviewItem[]) {
    const winTrades = trades.filter(t => t.profit > 0);
    const lossTrades = trades.filter(t => t.profit < 0);
    const profits = trades.map(t => t.profit);

    return {
      totalTrades: trades.length,
      winTrades: winTrades.length,
      lossTrades: lossTrades.length,
      winRate: trades.length > 0 ? Math.round((winTrades.length / trades.length) * 10000) / 100 : 0,
      totalProfit: Math.round(profits.reduce((a, b) => a + b, 0) * 100) / 100,
      avgProfit: trades.length > 0 ? Math.round((profits.reduce((a, b) => a + b, 0) / trades.length) * 100) / 100 : 0,
      avgHoldDays: trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.holdDays, 0) / trades.length) : 0,
      maxProfit: profits.length > 0 ? Math.max(...profits) : 0,
      maxLoss: profits.length > 0 ? Math.min(...profits) : 0,
    };
  }

  private analyzePatterns(trades: TradeReviewItem[]): PatternAnalysis[] {
    const tagStats = new Map<string, { wins: number; total: number; profit: number }>();

    for (const trade of trades) {
      for (const tag of trade.tags) {
        const stat = tagStats.get(tag) || { wins: 0, total: 0, profit: 0 };
        stat.total++;
        stat.profit += trade.profit;
        if (trade.profit > 0) stat.wins++;
        tagStats.set(tag, stat);
      }
    }

    return Array.from(tagStats.entries()).map(([pattern, stat]) => ({
      pattern,
      count: stat.total,
      winRate: Math.round((stat.wins / stat.total) * 10000) / 100,
      avgProfit: Math.round((stat.profit / stat.total) * 100) / 100,
    }));
  }

  private generateSuggestions(summary: any, patterns: PatternAnalysis[]): string[] {
    const suggestions: string[] = [];

    if (summary.winRate < 40) {
      suggestions.push('胜率偏低，建议优化选股策略或提高入场时机把握');
    }

    if (summary.avgHoldDays < 3) {
      suggestions.push('持仓时间较短，可能存在频繁交易问题');
    }

    if (Math.abs(summary.maxLoss) > summary.maxProfit) {
      suggestions.push('最大亏损超过最大盈利，建议严格执行止损纪律');
    }

    const lowWinPatterns = patterns.filter(p => p.winRate < 30 && p.count >= 3);
    if (lowWinPatterns.length > 0) {
      suggestions.push(`策略 "${lowWinPatterns[0].pattern}" 胜率较低，建议复盘优化`);
    }

    if (suggestions.length === 0) {
      suggestions.push('交易表现良好，继续保持当前策略');
    }

    return suggestions;
  }
}

export const tradeReviewService = new TradeReviewService();
