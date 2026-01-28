import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export interface CorrelationPair {
  stock1: string;
  stock2: string;
  name1: string;
  name2: string;
  correlation: number;
  level: 'high' | 'medium' | 'low' | 'negative';
}

export interface PositionCorrelation {
  stockCode: string;
  stockName: string;
  industry: string;
  weight: number;
  correlations: { code: string; name: string; value: number }[];
}

export interface DiversificationScore {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  industryConcentration: number;
  topHoldingWeight: number;
  suggestions: string[];
}

class CorrelationAnalysisService {
  // 获取股票历史价格
  private async getStockPrices(code: string, days: number = 60): Promise<number[]> {
    try {
      const market = code.startsWith('6') ? '1' : '0';
      const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get`;
      const response = await axios.get(url, {
        params: {
          secid: `${market}.${code}`,
          fields1: 'f1',
          fields2: 'f51,f52,f53,f54,f55',
          klt: 101,
          fqt: 1,
          end: '20500101',
          lmt: days,
        },
      });

      if (response.data?.data?.klines) {
        return response.data.data.klines.map((k: string) => {
          const parts = k.split(',');
          return parseFloat(parts[2]); // 收盘价
        });
      }
      return [];
    } catch {
      return [];
    }
  }

  // 计算皮尔逊相关系数
  private calculateCorrelation(prices1: number[], prices2: number[]): number {
    const n = Math.min(prices1.length, prices2.length);
    if (n < 10) return 0;

    const p1 = prices1.slice(-n);
    const p2 = prices2.slice(-n);

    // 计算收益率
    const returns1 = p1.slice(1).map((v, i) => (v - p1[i]) / p1[i]);
    const returns2 = p2.slice(1).map((v, i) => (v - p2[i]) / p2[i]);

    const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
    const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator > 0 ? numerator / denominator : 0;
  }

  async analyzeCorrelations(userId: string): Promise<CorrelationPair[]> {
    const positions = await prisma.position.findMany({
      where: { userId, quantity: { gt: 0 } },
      select: { stockCode: true, stockName: true },
    });

    if (positions.length < 2) return [];

    const pricesMap = new Map<string, number[]>();
    for (const pos of positions) {
      const prices = await this.getStockPrices(pos.stockCode);
      if (prices.length > 0) {
        pricesMap.set(pos.stockCode, prices);
      }
    }

    const pairs: CorrelationPair[] = [];
    const codes = Array.from(pricesMap.keys());

    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const code1 = codes[i];
        const code2 = codes[j];
        const prices1 = pricesMap.get(code1)!;
        const prices2 = pricesMap.get(code2)!;

        const correlation = this.calculateCorrelation(prices1, prices2);
        const pos1 = positions.find(p => p.stockCode === code1)!;
        const pos2 = positions.find(p => p.stockCode === code2)!;

        let level: 'high' | 'medium' | 'low' | 'negative';
        if (correlation >= 0.7) level = 'high';
        else if (correlation >= 0.4) level = 'medium';
        else if (correlation >= 0) level = 'low';
        else level = 'negative';

        pairs.push({
          stock1: code1,
          stock2: code2,
          name1: pos1.stockName,
          name2: pos2.stockName,
          correlation: Math.round(correlation * 100) / 100,
          level,
        });
      }
    }

    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  async getDiversificationScore(userId: string): Promise<DiversificationScore> {
    const positions = await prisma.position.findMany({
      where: { userId, quantity: { gt: 0 } },
      select: {
        stockCode: true,
        stockName: true,
        industry: true,
        totalCost: true,
      },
    });

    if (positions.length === 0) {
      return {
        score: 0,
        level: 'poor',
        industryConcentration: 100,
        topHoldingWeight: 100,
        suggestions: ['暂无持仓数据'],
      };
    }

    const totalValue = positions.reduce((sum, p) => sum + Number(p.totalCost), 0);
    const weights = positions.map(p => ({
      ...p,
      weight: totalValue > 0 ? (Number(p.totalCost) / totalValue) * 100 : 0,
    }));

    // 行业集中度
    const industryMap = new Map<string, number>();
    for (const p of weights) {
      const ind = p.industry || '未知';
      industryMap.set(ind, (industryMap.get(ind) || 0) + p.weight);
    }
    const maxIndustryWeight = Math.max(...industryMap.values());

    // 最大持仓权重
    const topWeight = Math.max(...weights.map(w => w.weight));

    // 计算分散度得分
    let score = 100;
    const suggestions: string[] = [];

    // 持仓数量评分
    if (positions.length < 3) {
      score -= 30;
      suggestions.push('持仓数量过少，建议增加到5-10只');
    } else if (positions.length > 15) {
      score -= 10;
      suggestions.push('持仓数量过多，可能难以跟踪');
    }

    // 行业集中度评分
    if (maxIndustryWeight > 50) {
      score -= 25;
      suggestions.push(`行业集中度过高(${maxIndustryWeight.toFixed(1)}%)，建议分散到不同行业`);
    } else if (maxIndustryWeight > 30) {
      score -= 10;
    }

    // 单一持仓权重评分
    if (topWeight > 40) {
      score -= 20;
      suggestions.push(`单一持仓权重过高(${topWeight.toFixed(1)}%)，建议降低集中度`);
    } else if (topWeight > 25) {
      score -= 10;
    }

    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) level = 'excellent';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else level = 'poor';

    if (suggestions.length === 0) {
      suggestions.push('持仓分散度良好，继续保持');
    }

    return {
      score: Math.max(0, score),
      level,
      industryConcentration: Math.round(maxIndustryWeight * 100) / 100,
      topHoldingWeight: Math.round(topWeight * 100) / 100,
      suggestions,
    };
  }
}

export const correlationAnalysisService = new CorrelationAnalysisService();
