import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface DipPlan {
  baseAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  valuationBased: boolean;
  lowThreshold: number;
  highThreshold: number;
}

export interface DipSchedule {
  date: string;
  amount: number;
  multiplier: number;
  reason: string;
}

export interface DipResult {
  totalInvested: number;
  totalShares: number;
  avgCost: number;
  currentValue: number;
  profit: number;
  profitRate: number;
}

class SmartDipService {
  // 生成智能定投计划
  generatePlan(
    plan: DipPlan,
    currentPE: number,
    months: number = 12
  ): DipSchedule[] {
    const schedules: DipSchedule[] = [];
    const now = new Date();

    const interval = plan.frequency === 'weekly' ? 7 :
                     plan.frequency === 'biweekly' ? 14 : 30;

    const totalDays = months * 30;
    let currentDate = new Date(now);

    for (let day = 0; day < totalDays; day += interval) {
      currentDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);

      let multiplier = 1;
      let reason = '常规定投';

      if (plan.valuationBased) {
        const result = this.calculateMultiplier(currentPE, plan);
        multiplier = result.multiplier;
        reason = result.reason;
      }

      schedules.push({
        date: currentDate.toISOString().split('T')[0],
        amount: Math.round(plan.baseAmount * multiplier),
        multiplier,
        reason,
      });
    }

    return schedules;
  }

  // 根据估值计算定投倍数
  private calculateMultiplier(
    pe: number,
    plan: DipPlan
  ): { multiplier: number; reason: string } {
    if (pe < plan.lowThreshold * 0.8) {
      return { multiplier: 2.0, reason: '极度低估，双倍定投' };
    } else if (pe < plan.lowThreshold) {
      return { multiplier: 1.5, reason: '低估区间，1.5倍定投' };
    } else if (pe > plan.highThreshold * 1.2) {
      return { multiplier: 0, reason: '极度高估，暂停定投' };
    } else if (pe > plan.highThreshold) {
      return { multiplier: 0.5, reason: '高估区间，减半定投' };
    }
    return { multiplier: 1, reason: '正常估值，常规定投' };
  }

  // 计算定投收益
  calculateResult(
    investments: { date: string; amount: number; price: number }[],
    currentPrice: number
  ): DipResult {
    let totalInvested = 0;
    let totalShares = 0;

    for (const inv of investments) {
      totalInvested += inv.amount;
      totalShares += inv.amount / inv.price;
    }

    const avgCost = totalInvested / totalShares;
    const currentValue = totalShares * currentPrice;
    const profit = currentValue - totalInvested;
    const profitRate = (profit / totalInvested) * 100;

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalShares: Math.round(totalShares * 100) / 100,
      avgCost: Math.round(avgCost * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitRate: Math.round(profitRate * 100) / 100,
    };
  }
}

export const smartDipService = new SmartDipService();
