import { prisma } from '../app';

export interface TradingInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion?: string;
}

export interface TradingPattern {
  pattern: string;
  frequency: number;
  avgProfit: number;
  winRate: number;
}

export interface RiskAlert {
  level: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  relatedStocks?: string[];
}

export interface AIAnalysisResult {
  insights: TradingInsight[];
  patterns: TradingPattern[];
  riskAlerts: RiskAlert[];
  suggestions: string[];
  summary: string;
}

export class AIAnalysisService {
  /**
   * 获取AI分析结果
   */
  static async getAnalysis(userId: string): Promise<AIAnalysisResult> {
    const [insights, patterns, riskAlerts] = await Promise.all([
      this.generateInsights(userId),
      this.analyzePatterns(userId),
      this.detectRisks(userId),
    ]);

    const suggestions = this.generateSuggestions(insights, patterns, riskAlerts);
    const summary = this.generateSummary(insights, patterns, riskAlerts);

    return {
      insights,
      patterns,
      riskAlerts,
      suggestions,
      summary,
    };
  }

  /**
   * 生成交易洞察
   */
  private static async generateInsights(userId: string): Promise<TradingInsight[]> {
    const insights: TradingInsight[] = [];

    // 获取最近30天的日记数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      include: {
        trades: true,
      },
      orderBy: { date: 'desc' },
    });

    if (diaries.length === 0) {
      return [{
        type: 'info',
        title: '数据不足',
        description: '暂无足够的交易数据进行分析，请继续记录交易日记。',
      }];
    }

    // 分析胜率趋势
    const recentDiaries = diaries.slice(0, 10);
    const olderDiaries = diaries.slice(10, 20);

    if (recentDiaries.length >= 5 && olderDiaries.length >= 5) {
      const recentWinRate = this.calculateWinRate(recentDiaries);
      const olderWinRate = this.calculateWinRate(olderDiaries);

      if (recentWinRate > olderWinRate + 10) {
        insights.push({
          type: 'success',
          title: '胜率提升',
          description: `近期胜率 ${recentWinRate.toFixed(1)}%，较之前提升了 ${(recentWinRate - olderWinRate).toFixed(1)}%`,
          suggestion: '继续保持当前的交易策略和纪律。',
        });
      } else if (recentWinRate < olderWinRate - 10) {
        insights.push({
          type: 'warning',
          title: '胜率下降',
          description: `近期胜率 ${recentWinRate.toFixed(1)}%，较之前下降了 ${(olderWinRate - recentWinRate).toFixed(1)}%`,
          suggestion: '建议回顾近期交易，分析失败原因，适当降低仓位。',
        });
      }
    }

    // 分析情绪与收益关系
    const emotionStats = await this.analyzeEmotionProfit(userId);
    const bestEmotion = emotionStats.sort((a, b) => b.winRate - a.winRate)[0];
    const worstEmotion = emotionStats.sort((a, b) => a.winRate - b.winRate)[0];

    if (bestEmotion && worstEmotion && bestEmotion.emotion !== worstEmotion.emotion) {
      insights.push({
        type: 'info',
        title: '情绪影响分析',
        description: `${bestEmotion.label}时胜率最高(${bestEmotion.winRate.toFixed(1)}%)，${worstEmotion.label}时胜率最低(${worstEmotion.winRate.toFixed(1)}%)`,
        suggestion: `建议在${worstEmotion.label}时减少交易或降低仓位。`,
      });
    }

    // 分析连续亏损
    let maxConsecutiveLoss = 0;
    let currentLossStreak = 0;
    for (const diary of diaries) {
      if (diary.profitLossAmount && Number(diary.profitLossAmount) < 0) {
        currentLossStreak++;
        maxConsecutiveLoss = Math.max(maxConsecutiveLoss, currentLossStreak);
      } else {
        currentLossStreak = 0;
      }
    }

    if (maxConsecutiveLoss >= 3) {
      insights.push({
        type: 'warning',
        title: '连续亏损提醒',
        description: `近期出现过${maxConsecutiveLoss}天连续亏损`,
        suggestion: '连续亏损后建议暂停交易1-2天，调整心态后再入场。',
      });
    }

    // 分析交易频率
    const avgTradesPerDay = diaries.reduce((sum, d) => sum + d.trades.length, 0) / diaries.length;
    if (avgTradesPerDay > 5) {
      insights.push({
        type: 'warning',
        title: '交易频率过高',
        description: `平均每天交易 ${avgTradesPerDay.toFixed(1)} 次，可能存在过度交易`,
        suggestion: '建议减少交易频率，专注于高确定性机会。',
      });
    }

    return insights;
  }

  /**
   * 分析交易模式
   */
  private static async analyzePatterns(userId: string): Promise<TradingPattern[]> {
    const patterns: TradingPattern[] = [];

    // 获取所有交易记录
    const trades = await prisma.trade.findMany({
      where: {
        diary: { userId },
      },
      include: {
        diary: {
          select: {
            date: true,
            profitLossAmount: true,
            profitLossPercent: true,
          },
        },
      },
    });

    // 按策略标签分组分析
    const strategyStats = new Map<string, { count: number; profits: number[]; wins: number }>();

    for (const trade of trades) {
      const strategy = trade.strategyTag || '无策略';
      const profit = trade.diary.profitLossAmount ? Number(trade.diary.profitLossAmount) : 0;

      const stats = strategyStats.get(strategy) || { count: 0, profits: [], wins: 0 };
      stats.count++;
      stats.profits.push(profit);
      if (profit > 0) stats.wins++;
      strategyStats.set(strategy, stats);
    }

    for (const [strategy, stats] of strategyStats) {
      if (stats.count >= 3) {
        const avgProfit = stats.profits.reduce((a, b) => a + b, 0) / stats.count;
        const winRate = (stats.wins / stats.count) * 100;

        patterns.push({
          pattern: strategy,
          frequency: stats.count,
          avgProfit: Math.round(avgProfit * 100) / 100,
          winRate: Math.round(winRate * 100) / 100,
        });
      }
    }

    // 按收益排序
    patterns.sort((a, b) => b.avgProfit - a.avgProfit);

    return patterns.slice(0, 5);
  }

  /**
   * 检测风险
   */
  private static async detectRisks(userId: string): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    // 获取最近的日记
    const recentDiary = await prisma.diary.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        trades: true,
        stopLosses: true,
      },
    });

    if (!recentDiary) return alerts;

    // 检查止损设置
    const tradesWithoutStopLoss = recentDiary.trades.filter(
      trade => trade.direction === 'BUY' && !recentDiary.stopLosses.some(sl => sl.stockCode === trade.stockCode)
    );

    if (tradesWithoutStopLoss.length > 0) {
      alerts.push({
        level: 'high',
        type: '止损缺失',
        message: `有 ${tradesWithoutStopLoss.length} 只股票未设置止损`,
        relatedStocks: tradesWithoutStopLoss.map(t => `${t.stockName}(${t.stockCode})`),
      });
    }

    // 检查单只股票仓位
    const totalAmount = recentDiary.trades.reduce((sum, t) => sum + Number(t.amount), 0);
    for (const trade of recentDiary.trades) {
      const position = (Number(trade.amount) / totalAmount) * 100;
      if (position > 30) {
        alerts.push({
          level: 'medium',
          type: '仓位过重',
          message: `${trade.stockName} 仓位占比 ${position.toFixed(1)}%，超过30%`,
          relatedStocks: [`${trade.stockName}(${trade.stockCode})`],
        });
      }
    }

    // 检查连续亏损
    const recentDiaries = await prisma.diary.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      select: { profitLossAmount: true },
    });

    const consecutiveLosses = recentDiaries.filter(d => d.profitLossAmount && Number(d.profitLossAmount) < 0).length;
    if (consecutiveLosses >= 3) {
      alerts.push({
        level: 'high',
        type: '连续亏损',
        message: `最近5天中有${consecutiveLosses}天亏损，建议暂停交易`,
      });
    }

    return alerts;
  }

  /**
   * 分析情绪与收益关系
   */
  private static async analyzeEmotionProfit(userId: string) {
    const diaries = await prisma.diary.findMany({
      where: { userId },
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

    const stats = new Map<string, { total: number; wins: number }>();

    for (const diary of diaries) {
      if (diary.emotionBefore && diary.profitLossAmount !== null) {
        const emotion = diary.emotionBefore;
        const profit = Number(diary.profitLossAmount);

        const existing = stats.get(emotion) || { total: 0, wins: 0 };
        existing.total++;
        if (profit > 0) existing.wins++;
        stats.set(emotion, existing);
      }
    }

    return Array.from(stats.entries()).map(([emotion, data]) => ({
      emotion,
      label: emotionLabels[emotion] || emotion,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    }));
  }

  /**
   * 计算胜率
   */
  private static calculateWinRate(diaries: any[]): number {
    const withProfit = diaries.filter(d => d.profitLossAmount !== null);
    if (withProfit.length === 0) return 0;

    const wins = withProfit.filter(d => Number(d.profitLossAmount) > 0).length;
    return (wins / withProfit.length) * 100;
  }

  /**
   * 生成建议
   */
  private static generateSuggestions(
    insights: TradingInsight[],
    patterns: TradingPattern[],
    riskAlerts: RiskAlert[]
  ): string[] {
    const suggestions: string[] = [];

    // 基于洞察生成建议
    for (const insight of insights) {
      if (insight.suggestion) {
        suggestions.push(insight.suggestion);
      }
    }

    // 基于模式生成建议
    const bestPattern = patterns.find(p => p.winRate > 60 && p.avgProfit > 0);
    if (bestPattern) {
      suggestions.push(`"${bestPattern.pattern}"策略表现优秀，建议继续使用并加大该策略的仓位。`);
    }

    const worstPattern = patterns.find(p => p.winRate < 40 || p.avgProfit < 0);
    if (worstPattern) {
      suggestions.push(`"${worstPattern.pattern}"策略表现不佳，建议减少使用或优化该策略。`);
    }

    // 基于风险生成建议
    const highRisks = riskAlerts.filter(r => r.level === 'high');
    if (highRisks.length > 0) {
      suggestions.push('存在高风险警告，建议立即处理后再进行新的交易。');
    }

    return suggestions.slice(0, 5);
  }

  /**
   * 生成总结
   */
  private static generateSummary(
    insights: TradingInsight[],
    patterns: TradingPattern[],
    riskAlerts: RiskAlert[]
  ): string {
    const successCount = insights.filter(i => i.type === 'success').length;
    const warningCount = insights.filter(i => i.type === 'warning').length;
    const highRiskCount = riskAlerts.filter(r => r.level === 'high').length;

    if (highRiskCount > 0) {
      return `当前存在${highRiskCount}个高风险警告，建议谨慎操作，优先处理风险问题。`;
    }

    if (warningCount > successCount) {
      return '近期交易表现有待改善，建议回顾交易策略，适当降低仓位和交易频率。';
    }

    if (successCount > 0) {
      return '近期交易表现良好，继续保持当前的交易纪律和策略。';
    }

    return '继续记录交易日记，积累更多数据以获得更准确的分析。';
  }
}
