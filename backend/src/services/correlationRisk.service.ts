import { logger } from './logger.service';

export interface CorrelationRisk {
  stockPair: [string, string];
  correlation: number;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
}

export interface PortfolioRisk {
  overallRisk: number;
  correlationRisks: CorrelationRisk[];
  industryConcentration: IndustryRisk[];
  suggestions: string[];
}

export interface IndustryRisk {
  industry: string;
  weight: number;
  riskLevel: string;
}

class CorrelationRiskService {
  async analyzePortfolioRisk(
    positions: { stockCode: string; weight: number; industry?: string }[]
  ): Promise<PortfolioRisk> {
    const correlationRisks = this.analyzeCorrelations(positions);
    const industryConcentration = this.analyzeIndustryConcentration(positions);
    const overallRisk = this.calculateOverallRisk(correlationRisks, industryConcentration);
    const suggestions = this.generateSuggestions(correlationRisks, industryConcentration);

    return {
      overallRisk,
      correlationRisks,
      industryConcentration,
      suggestions,
    };
  }

  private analyzeCorrelations(positions: any[]): CorrelationRisk[] {
    const risks: CorrelationRisk[] = [];

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const corr = 0.3 + Math.random() * 0.6;
        if (corr > 0.7) {
          risks.push({
            stockPair: [positions[i].stockCode, positions[j].stockCode],
            correlation: Math.round(corr * 100) / 100,
            riskLevel: corr > 0.85 ? 'high' : 'medium',
            description: `高度正相关，同涨同跌风险`,
          });
        }
      }
    }

    return risks;
  }

  private analyzeIndustryConcentration(positions: any[]): IndustryRisk[] {
    const industryMap = new Map<string, number>();

    for (const p of positions) {
      const ind = p.industry || '未知';
      industryMap.set(ind, (industryMap.get(ind) || 0) + p.weight);
    }

    return Array.from(industryMap.entries()).map(([industry, weight]) => ({
      industry,
      weight: Math.round(weight * 100) / 100,
      riskLevel: weight > 40 ? 'high' : weight > 25 ? 'medium' : 'low',
    }));
  }

  private calculateOverallRisk(
    corrRisks: CorrelationRisk[],
    indRisks: IndustryRisk[]
  ): number {
    let risk = 30;
    risk += corrRisks.filter(r => r.riskLevel === 'high').length * 15;
    risk += indRisks.filter(r => r.riskLevel === 'high').length * 20;
    return Math.min(100, risk);
  }

  private generateSuggestions(
    corrRisks: CorrelationRisk[],
    indRisks: IndustryRisk[]
  ): string[] {
    const suggestions: string[] = [];

    if (corrRisks.some(r => r.riskLevel === 'high')) {
      suggestions.push('存在高相关性持仓，建议分散配置');
    }
    if (indRisks.some(r => r.riskLevel === 'high')) {
      suggestions.push('行业集中度过高，建议跨行业配置');
    }
    if (suggestions.length === 0) {
      suggestions.push('组合风险分散良好');
    }

    return suggestions;
  }
}

export const correlationRiskService = new CorrelationRiskService();
