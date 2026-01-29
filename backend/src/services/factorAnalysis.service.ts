import { cacheService } from './cache.service';
import { logger } from './logger.service';

export interface FactorScore {
  stockCode: string;
  stockName: string;
  factors: Record<string, number>;
  totalScore: number;
}

export interface FactorWeight {
  name: string;
  weight: number;
}

class FactorAnalysisService {
  private defaultWeights: FactorWeight[] = [
    { name: 'value', weight: 0.25 },
    { name: 'momentum', weight: 0.20 },
    { name: 'quality', weight: 0.25 },
    { name: 'size', weight: 0.15 },
    { name: 'volatility', weight: 0.15 },
  ];

  // 多因子选股
  async screenByFactors(
    weights: FactorWeight[] = this.defaultWeights,
    limit: number = 30
  ): Promise<FactorScore[]> {
    try {
      const stocks = await this.fetchStockData(limit * 3);
      const scored = stocks.map(s => this.calculateScore(s, weights));
      return scored.sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
    } catch (error) {
      logger.error('Factor analysis error:', error);
      return [];
    }
  }

  // 获取股票数据
  private async fetchStockData(limit: number): Promise<any[]> {
    const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=${limit}&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f9,f12,f14,f20,f23,f115,f8`;

    const response = await fetch(url, {
      headers: { 'Referer': 'https://quote.eastmoney.com/' }
    });
    const data: any = await response.json();

    if (!data.data?.diff) return [];
    return data.data.diff;
  }

  // 计算因子得分
  private calculateScore(stock: any, weights: FactorWeight[]): FactorScore {
    const factors: Record<string, number> = {
      value: this.valueScore(stock),
      momentum: this.momentumScore(stock),
      quality: this.qualityScore(stock),
      size: this.sizeScore(stock),
      volatility: this.volatilityScore(stock),
    };

    let totalScore = 0;
    for (const w of weights) {
      totalScore += (factors[w.name] || 0) * w.weight;
    }

    return {
      stockCode: stock.f12,
      stockName: stock.f14,
      factors,
      totalScore: Math.round(totalScore * 100) / 100,
    };
  }

  // 价值因子 (PE、PB越低越好)
  private valueScore(stock: any): number {
    const pe = stock.f9 || 100;
    const pb = stock.f23 || 10;
    const peScore = pe > 0 && pe < 50 ? (50 - pe) / 50 * 100 : 0;
    const pbScore = pb > 0 && pb < 5 ? (5 - pb) / 5 * 100 : 0;
    return (peScore + pbScore) / 2;
  }

  // 动量因子 (涨幅)
  private momentumScore(stock: any): number {
    const change = stock.f3 || 0;
    return Math.max(0, Math.min(100, 50 + change * 5));
  }

  // 质量因子 (ROE越高越好)
  private qualityScore(stock: any): number {
    const roe = stock.f115 || 0;
    if (roe <= 0) return 0;
    return Math.min(100, roe * 5);
  }

  // 规模因子 (市值适中为佳)
  private sizeScore(stock: any): number {
    const marketCap = stock.f20 || 0;
    const capInBillion = marketCap / 100000000;
    if (capInBillion < 50) return 80;
    if (capInBillion < 200) return 100;
    if (capInBillion < 500) return 70;
    return 50;
  }

  // 波动因子 (换手率适中为佳)
  private volatilityScore(stock: any): number {
    const turnover = stock.f8 || 0;
    if (turnover < 1) return 40;
    if (turnover < 3) return 80;
    if (turnover < 8) return 100;
    if (turnover < 15) return 60;
    return 30;
  }
}

export const factorAnalysisService = new FactorAnalysisService();