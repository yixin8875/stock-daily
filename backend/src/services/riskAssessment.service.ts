import { PrismaClient } from '@prisma/client';
import { technicalIndicators } from './technicalIndicators.service';
import { chartDataService } from './chartData.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface RiskMetrics {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number;
  concentrationRisk: number;
}

export interface PositionRisk {
  stockCode: string;
  stockName: string;
  weight: number;
  volatility: number;
  contribution: number;
}

export interface RiskReport {
  userId: string;
  generatedAt: Date;
  totalValue: number;
  metrics: RiskMetrics;
  positionRisks: PositionRisk[];
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

class RiskAssessmentService {
  async generateReport(userId: string): Promise<RiskReport> {
    const positions = await this.getPositions(userId);
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);

    const positionRisks = await this.analyzePositions(positions, totalValue);
    const metrics = this.calculatePortfolioMetrics(positionRisks);
    const riskLevel = this.determineRiskLevel(metrics);
    const suggestions = this.generateSuggestions(metrics, positionRisks);

    return {
      userId,
      generatedAt: new Date(),
      totalValue,
      metrics,
      positionRisks,
      riskLevel,
      suggestions,
    };
  }

  private async getPositions(userId: string) {
    const positions = await prisma.position.findMany({
      where: { userId },
    });
    return positions.map(p => ({
      stockCode: p.stockCode,
      stockName: p.stockName,
      quantity: p.quantity,
      costPrice: Number(p.costPrice),
      currentPrice: Number(p.costPrice),
      marketValue: p.quantity * Number(p.costPrice),
    }));
  }

  private async analyzePositions(positions: any[], totalValue: number): Promise<PositionRisk[]> {
    const risks: PositionRisk[] = [];

    for (const pos of positions) {
      const klines = await chartDataService.getKLineData(pos.stockCode, 'daily', 60);
      const closes = klines.map(k => k.close);
      const volatility = this.calculateVolatility(closes);
      const weight = totalValue > 0 ? pos.marketValue / totalValue : 0;

      risks.push({
        stockCode: pos.stockCode,
        stockName: pos.stockName,
        weight: Math.round(weight * 10000) / 100,
        volatility: Math.round(volatility * 10000) / 100,
        contribution: Math.round(weight * volatility * 10000) / 100,
      });
    }

    return risks;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252);
  }

  private calculatePortfolioMetrics(positionRisks: PositionRisk[]): RiskMetrics {
    const portfolioVol = positionRisks.reduce((sum, p) => sum + p.contribution, 0);
    const weights = positionRisks.map(p => p.weight / 100);
    const maxWeight = Math.max(...weights, 0);
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);

    return {
      volatility: Math.round(portfolioVol * 100) / 100,
      beta: 1.0,
      sharpeRatio: portfolioVol > 0 ? Math.round((8 / portfolioVol) * 100) / 100 : 0,
      maxDrawdown: Math.round(portfolioVol * 1.5 * 100) / 100,
      var95: Math.round(portfolioVol * 1.65 * 100) / 100,
      concentrationRisk: Math.round(hhi * 10000) / 100,
    };
  }

  private determineRiskLevel(metrics: RiskMetrics): 'low' | 'medium' | 'high' {
    if (metrics.volatility > 40 || metrics.concentrationRisk > 50) return 'high';
    if (metrics.volatility > 25 || metrics.concentrationRisk > 30) return 'medium';
    return 'low';
  }

  private generateSuggestions(metrics: RiskMetrics, positions: PositionRisk[]): string[] {
    const suggestions: string[] = [];

    if (metrics.volatility > 30) {
      suggestions.push('组合波动率较高，建议增加低波动性资产');
    }

    if (metrics.concentrationRisk > 40) {
      suggestions.push('持仓集中度过高，建议分散投资降低风险');
    }

    const highVolPositions = positions.filter(p => p.volatility > 50);
    if (highVolPositions.length > 0) {
      suggestions.push(`${highVolPositions.map(p => p.stockName).join('、')} 波动较大，注意控制仓位`);
    }

    if (metrics.maxDrawdown > 20) {
      suggestions.push('潜在最大回撤较大，建议设置止损位');
    }

    if (suggestions.length === 0) {
      suggestions.push('当前组合风险可控，继续保持');
    }

    return suggestions;
  }
}

export const riskAssessmentService = new RiskAssessmentService();
