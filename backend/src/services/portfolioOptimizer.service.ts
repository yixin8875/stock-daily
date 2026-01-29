import { chartDataService } from './chartData.service';
import { logger } from './logger.service';

export interface OptimizationResult {
  weights: { stockCode: string; weight: number }[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

export interface EfficientFrontierPoint {
  return: number;
  volatility: number;
  weights: number[];
}

class PortfolioOptimizerService {
  // 计算收益率序列
  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  // 计算协方差矩阵
  private calculateCovarianceMatrix(returnsMatrix: number[][]): number[][] {
    const n = returnsMatrix.length;
    const means = returnsMatrix.map(r => r.reduce((a, b) => a + b, 0) / r.length);
    const cov: number[][] = [];

    for (let i = 0; i < n; i++) {
      cov[i] = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        const len = Math.min(returnsMatrix[i].length, returnsMatrix[j].length);
        for (let k = 0; k < len; k++) {
          sum += (returnsMatrix[i][k] - means[i]) * (returnsMatrix[j][k] - means[j]);
        }
        cov[i][j] = sum / (len - 1);
      }
    }
    return cov;
  }

  // 计算组合收益和波动率
  private calculatePortfolioMetrics(
    weights: number[],
    returns: number[],
    covMatrix: number[][]
  ): { return: number; volatility: number } {
    let portfolioReturn = 0;
    for (let i = 0; i < weights.length; i++) {
      portfolioReturn += weights[i] * returns[i];
    }

    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covMatrix[i][j];
      }
    }

    return {
      return: portfolioReturn * 252,
      volatility: Math.sqrt(variance * 252),
    };
  }

  // 最大夏普比率优化
  async optimizeMaxSharpe(
    stockCodes: string[],
    riskFreeRate: number = 0.03
  ): Promise<OptimizationResult | null> {
    try {
      const returnsMatrix = await this.getReturnsMatrix(stockCodes);
      if (!returnsMatrix) return null;

      const means = returnsMatrix.map(r => r.reduce((a, b) => a + b, 0) / r.length);
      const covMatrix = this.calculateCovarianceMatrix(returnsMatrix);

      // 简化优化：随机搜索最优权重
      let bestWeights = this.equalWeights(stockCodes.length);
      let bestSharpe = -Infinity;

      for (let i = 0; i < 1000; i++) {
        const weights = this.randomWeights(stockCodes.length);
        const metrics = this.calculatePortfolioMetrics(weights, means, covMatrix);
        const sharpe = (metrics.return - riskFreeRate) / metrics.volatility;

        if (sharpe > bestSharpe) {
          bestSharpe = sharpe;
          bestWeights = weights;
        }
      }

      const finalMetrics = this.calculatePortfolioMetrics(bestWeights, means, covMatrix);

      return {
        weights: stockCodes.map((code, i) => ({
          stockCode: code,
          weight: Math.round(bestWeights[i] * 10000) / 100,
        })),
        expectedReturn: Math.round(finalMetrics.return * 10000) / 100,
        volatility: Math.round(finalMetrics.volatility * 10000) / 100,
        sharpeRatio: Math.round(bestSharpe * 100) / 100,
      };
    } catch (error) {
      logger.error('Portfolio optimization error:', error);
      return null;
    }
  }

  // 获取收益率矩阵
  private async getReturnsMatrix(stockCodes: string[]): Promise<number[][] | null> {
    const matrix: number[][] = [];
    for (const code of stockCodes) {
      const klines = await chartDataService.getKLineData(code, 'daily', 60);
      if (klines.length < 30) return null;
      const prices = klines.map(k => k.close);
      matrix.push(this.calculateReturns(prices));
    }
    return matrix;
  }

  // 等权重
  private equalWeights(n: number): number[] {
    return Array(n).fill(1 / n);
  }

  // 随机权重
  private randomWeights(n: number): number[] {
    const raw = Array(n).fill(0).map(() => Math.random());
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map(w => w / sum);
  }
}

export const portfolioOptimizerService = new PortfolioOptimizerService();
