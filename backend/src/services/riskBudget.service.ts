// 风险预算管理服务
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RiskBudget {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  dailyLimit: number;
  positionLimit: number;
  sectorLimit: number;
}

interface RiskAlert {
  type: string;
  message: string;
  level: 'warning' | 'danger';
}

class RiskBudgetService {
  async getRiskBudget(userId: string): Promise<RiskBudget> {
    const positions = await prisma.position.findMany({
      where: { userId },
    });

    const totalValue = positions.reduce((sum, p) =>
      sum + Number(p.totalCost), 0);

    // 默认风险预算为总资产的10%
    const totalBudget = totalValue * 0.1;
    const usedBudget = this.calcUsedBudget(positions);

    return {
      totalBudget,
      usedBudget,
      remainingBudget: totalBudget - usedBudget,
      dailyLimit: totalValue * 0.02,
      positionLimit: totalValue * 0.25,
      sectorLimit: totalValue * 0.4,
    };
  }

  async checkRiskAlerts(userId: string): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];
    const positions = await prisma.position.findMany({
      where: { userId },
    });

    const totalValue = positions.reduce((sum, p) =>
      sum + Number(p.totalCost), 0);

    // 检查单只持仓占比
    for (const pos of positions) {
      const weight = Number(pos.totalCost) / totalValue * 100;
      if (weight > 30) {
        alerts.push({
          type: 'position',
          message: `${pos.stockName}仓位${weight.toFixed(1)}%超过30%限制`,
          level: 'danger',
        });
      } else if (weight > 25) {
        alerts.push({
          type: 'position',
          message: `${pos.stockName}仓位${weight.toFixed(1)}%接近30%限制`,
          level: 'warning',
        });
      }
    }

    // 检查行业集中度
    const sectorMap = new Map<string, number>();
    for (const pos of positions) {
      const sector = pos.industry || '其他';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + Number(pos.totalCost));
    }

    for (const [sector, value] of sectorMap) {
      const weight = value / totalValue * 100;
      if (weight > 40) {
        alerts.push({
          type: 'sector',
          message: `${sector}行业占比${weight.toFixed(1)}%超过40%限制`,
          level: 'danger',
        });
      }
    }

    return alerts;
  }

  private calcUsedBudget(positions: any[]): number {
    return positions.reduce((sum, p) => {
      const stopPrice = Number(p.stopPrice) || Number(p.costPrice) * 0.9;
      const risk = (Number(p.costPrice) - stopPrice) * p.quantity;
      return sum + Math.max(0, risk);
    }, 0);
  }
}

export const riskBudgetService = new RiskBudgetService();
