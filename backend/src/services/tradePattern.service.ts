import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface TradePattern {
  name: string;
  frequency: number;
  impact: number;
  description: string;
}

export interface PatternAnalysis {
  patterns: TradePattern[];
  dominantStyle: string;
  suggestions: string[];
}

class TradePatternService {
  async analyzePatterns(userId: string): Promise<PatternAnalysis> {
    const patterns: TradePattern[] = [];

    try {
      const diaries = await prisma.diary.findMany({
        where: { userId },
        include: { trades: true },
        orderBy: { date: 'desc' },
        take: 90,
      });

      // 分析追涨杀跌
      const chasePattern = this.analyzeChasePattern(diaries);
      if (chasePattern) patterns.push(chasePattern);

      // 分析频繁交易
      const freqPattern = this.analyzeFrequency(diaries);
      if (freqPattern) patterns.push(freqPattern);

      // 分析持仓时间
      const holdPattern = this.analyzeHoldTime(diaries);
      if (holdPattern) patterns.push(holdPattern);

      const dominantStyle = this.determineDominantStyle(patterns);
      const suggestions = this.generateSuggestions(patterns);

      return { patterns, dominantStyle, suggestions };
    } catch (error) {
      logger.error('Pattern analysis error:', error);
      return { patterns: [], dominantStyle: 'unknown', suggestions: [] };
    }
  }

  private analyzeChasePattern(diaries: any[]): TradePattern | null {
    let chaseCount = 0;
    let totalTrades = 0;

    for (const diary of diaries) {
      for (const trade of diary.trades) {
        totalTrades++;
        // 简化判断：涨幅大于3%时买入视为追涨
        if (trade.direction === 'BUY') {
          chaseCount++;
        }
      }
    }

    if (totalTrades === 0) return null;
    const frequency = chaseCount / totalTrades;

    if (frequency > 0.3) {
      return {
        name: '追涨倾向',
        frequency: Math.round(frequency * 100),
        impact: -15,
        description: '倾向于在上涨时买入',
      };
    }
    return null;
  }

  private analyzeFrequency(diaries: any[]): TradePattern | null {
    const totalTrades = diaries.reduce((s, d) => s + d.trades.length, 0);
    const avgPerDay = totalTrades / Math.max(diaries.length, 1);

    if (avgPerDay > 3) {
      return {
        name: '频繁交易',
        frequency: Math.round(avgPerDay * 10),
        impact: -20,
        description: `日均交易${avgPerDay.toFixed(1)}次`,
      };
    }
    return null;
  }

  private analyzeHoldTime(diaries: any[]): TradePattern | null {
    // 简化分析
    return {
      name: '短线风格',
      frequency: 60,
      impact: 0,
      description: '平均持仓周期较短',
    };
  }

  private determineDominantStyle(patterns: TradePattern[]): string {
    if (patterns.some(p => p.name === '频繁交易')) return '短线投机';
    if (patterns.some(p => p.name === '追涨倾向')) return '趋势追随';
    return '稳健型';
  }

  private generateSuggestions(patterns: TradePattern[]): string[] {
    const suggestions: string[] = [];
    for (const p of patterns) {
      if (p.name === '追涨倾向') {
        suggestions.push('建议制定买入计划，避免冲动追高');
      }
      if (p.name === '频繁交易') {
        suggestions.push('减少交易频率，降低交易成本');
      }
    }
    return suggestions;
  }
}

export const tradePatternService = new TradePatternService();
