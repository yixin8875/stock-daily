import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface TradeCost {
  commission: number;
  stampTax: number;
  transferFee: number;
  total: number;
}

export interface CostAnalysis {
  totalCost: number;
  costByType: { type: string; amount: number }[];
  costByMonth: { month: string; amount: number }[];
  avgCostPerTrade: number;
}

class TradeCostService {
  private commissionRate = 0.0003;
  private stampTaxRate = 0.001;
  private transferFeeRate = 0.00002;

  calculateCost(amount: number, direction: 'buy' | 'sell'): TradeCost {
    const commission = Math.max(5, amount * this.commissionRate);
    const stampTax = direction === 'sell' ? amount * this.stampTaxRate : 0;
    const transferFee = amount * this.transferFeeRate;

    return {
      commission: Math.round(commission * 100) / 100,
      stampTax: Math.round(stampTax * 100) / 100,
      transferFee: Math.round(transferFee * 100) / 100,
      total: Math.round((commission + stampTax + transferFee) * 100) / 100,
    };
  }
}

export const tradeCostService = new TradeCostService();
