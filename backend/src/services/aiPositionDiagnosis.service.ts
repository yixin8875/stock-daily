import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface PositionDiagnosis {
  stockCode: string;
  stockName: string;
  healthScore: number;
  issues: DiagnosisIssue[];
  suggestions: string[];
}

export interface DiagnosisIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

class AIPositionDiagnosisService {
  // 诊断单只持仓
  async diagnosePosition(
    stockCode: string,
    costPrice: number,
    currentPrice: number,
    weight: number
  ): Promise<PositionDiagnosis> {
    const issues: DiagnosisIssue[] = [];
    let healthScore = 100;

    // 检查浮亏
    const profitRate = ((currentPrice - costPrice) / costPrice) * 100;
    if (profitRate < -20) {
      issues.push({
        type: 'deep_loss',
        severity: 'high',
        description: `深度套牢，浮亏${Math.abs(profitRate).toFixed(1)}%`,
      });
      healthScore -= 30;
    } else if (profitRate < -10) {
      issues.push({
        type: 'loss',
        severity: 'medium',
        description: `浮亏${Math.abs(profitRate).toFixed(1)}%`,
      });
      healthScore -= 15;
    }

    // 检查仓位集中度
    if (weight > 30) {
      issues.push({
        type: 'concentration',
        severity: 'high',
        description: `仓位过重，占比${weight}%`,
      });
      healthScore -= 20;
    } else if (weight > 20) {
      issues.push({
        type: 'concentration',
        severity: 'medium',
        description: `仓位偏重，占比${weight}%`,
      });
      healthScore -= 10;
    }

    const suggestions = this.generateSuggestions(issues, profitRate);

    return {
      stockCode,
      stockName: '',
      healthScore: Math.max(0, healthScore),
      issues,
      suggestions,
    };
  }

  private generateSuggestions(issues: DiagnosisIssue[], profitRate: number): string[] {
    const suggestions: string[] = [];

    if (issues.some(i => i.type === 'deep_loss')) {
      suggestions.push('考虑分批补仓摊薄成本或止损换股');
    }
    if (issues.some(i => i.type === 'concentration')) {
      suggestions.push('建议适当减仓，分散风险');
    }
    if (profitRate > 20) {
      suggestions.push('盈利丰厚，可考虑部分止盈');
    }
    if (suggestions.length === 0) {
      suggestions.push('持仓状态良好，继续持有');
    }

    return suggestions;
  }
}

export const aiPositionDiagnosisService = new AIPositionDiagnosisService();
