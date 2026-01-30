import { logger } from './logger.service';

export interface StressTestResult {
  scenario: string;
  portfolioLoss: number;
  lossPercent: number;
  maxDrawdown: number;
  recoveryDays: number;
}

export interface StressTestReport {
  results: StressTestResult[];
  riskScore: number;
  suggestions: string[];
}

class StressTestService {
  async runStressTest(
    positions: { stockCode: string; value: number; beta?: number }[]
  ): Promise<StressTestReport> {
    const totalValue = positions.reduce((s, p) => s + p.value, 0);
    const scenarios = this.getScenarios();
    const results: StressTestResult[] = [];

    for (const scenario of scenarios) {
      const result = this.simulateScenario(positions, totalValue, scenario);
      results.push(result);
    }

    const riskScore = this.calculateRiskScore(results);
    const suggestions = this.generateSuggestions(results, riskScore);

    return { results, riskScore, suggestions };
  }

  private getScenarios() {
    return [
      { name: '温和回调', marketDrop: -5, duration: 10 },
      { name: '中度下跌', marketDrop: -10, duration: 20 },
      { name: '大幅下跌', marketDrop: -20, duration: 40 },
      { name: '极端暴跌', marketDrop: -30, duration: 60 },
    ];
  }

  private simulateScenario(
    positions: any[],
    totalValue: number,
    scenario: any
  ): StressTestResult {
    const avgBeta = positions.reduce((s, p) => s + (p.beta || 1), 0) / positions.length;
    const portfolioLoss = totalValue * (scenario.marketDrop / 100) * avgBeta;

    return {
      scenario: scenario.name,
      portfolioLoss: Math.round(portfolioLoss),
      lossPercent: Math.round(scenario.marketDrop * avgBeta * 100) / 100,
      maxDrawdown: Math.round(scenario.marketDrop * avgBeta * 1.2 * 100) / 100,
      recoveryDays: scenario.duration,
    };
  }

  private calculateRiskScore(results: StressTestResult[]): number {
    const extremeResult = results.find(r => r.scenario === '极端暴跌');
    if (!extremeResult) return 50;

    const lossPercent = Math.abs(extremeResult.lossPercent);
    if (lossPercent > 35) return 90;
    if (lossPercent > 25) return 70;
    if (lossPercent > 15) return 50;
    return 30;
  }

  private generateSuggestions(results: StressTestResult[], riskScore: number): string[] {
    const suggestions: string[] = [];

    if (riskScore > 70) {
      suggestions.push('组合风险较高，建议降低仓位或增加防御性配置');
    }
    if (riskScore > 50) {
      suggestions.push('考虑配置低Beta股票分散风险');
    }
    suggestions.push('保持适当现金比例应对极端行情');

    return suggestions;
  }
}

export const stressTestService = new StressTestService();
