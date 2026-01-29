import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface PositionSizeResult {
  kellyPercent: number;
  halfKellyPercent: number;
  fixedPercent: number;
  suggestedShares: number;
  maxLoss: number;
  riskRewardRatio: number;
}

export interface PositionInput {
  totalCapital: number;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  winRate?: number;
}

class PositionManagerService {
  // 凯利公式计算最优仓位
  calculateKelly(winRate: number, winLossRatio: number): number {
    // Kelly % = W - [(1-W) / R]
    // W = 胜率, R = 盈亏比
    const kelly = winRate - (1 - winRate) / winLossRatio;
    return Math.max(0, Math.min(kelly, 1));
  }

  // 计算建议仓位
  calculatePosition(input: PositionInput): PositionSizeResult {
    const { totalCapital, entryPrice, stopPrice, targetPrice, winRate = 0.5 } = input;

    const riskPerShare = entryPrice - stopPrice;
    const rewardPerShare = targetPrice - entryPrice;
    const riskRewardRatio = rewardPerShare / riskPerShare;

    const kellyPercent = this.calculateKelly(winRate, riskRewardRatio);
    const halfKellyPercent = kellyPercent / 2;

    // 固定风险法：每笔最多亏损2%
    const maxRiskAmount = totalCapital * 0.02;
    const fixedShares = Math.floor(maxRiskAmount / riskPerShare / 100) * 100;
    const fixedPercent = (fixedShares * entryPrice) / totalCapital;

    const suggestedShares = Math.floor((totalCapital * halfKellyPercent) / entryPrice / 100) * 100;
    const maxLoss = suggestedShares * riskPerShare;

    return {
      kellyPercent: Math.round(kellyPercent * 10000) / 100,
      halfKellyPercent: Math.round(halfKellyPercent * 10000) / 100,
      fixedPercent: Math.round(fixedPercent * 10000) / 100,
      suggestedShares,
      maxLoss: Math.round(maxLoss * 100) / 100,
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
    };
  }

  // 获取用户历史胜率
  async getUserWinRate(userId: string): Promise<number> {
    try {
      const diaries = await prisma.diary.findMany({
        where: { userId },
        select: { profitLossAmount: true },
      });

      if (diaries.length === 0) return 0.5;

      const wins = diaries.filter(d => Number(d.profitLossAmount) > 0).length;
      return wins / diaries.length;
    } catch (error) {
      logger.error('Get win rate error:', error);
      return 0.5;
    }
  }

  // 金字塔加仓计算
  pyramidPosition(baseShares: number, levels: number = 3): number[] {
    const positions: number[] = [];
    let remaining = baseShares;

    for (let i = 0; i < levels; i++) {
      const shares = Math.floor(remaining / (levels - i) / 100) * 100;
      positions.push(shares);
      remaining -= shares;
    }

    return positions;
  }
}

export const positionManagerService = new PositionManagerService();
