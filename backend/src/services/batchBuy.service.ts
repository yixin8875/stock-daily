import { logger } from './logger.service';

export interface BatchBuyPlan {
  totalAmount: number;
  batches: number;
  strategy: 'equal' | 'pyramid' | 'reverse_pyramid';
  priceRange: { high: number; low: number };
}

export interface BatchBuyResult {
  batch: number;
  price: number;
  amount: number;
  shares: number;
  cumAmount: number;
  cumShares: number;
  avgCost: number;
}

class BatchBuyService {
  // 生成分批建仓计划
  generatePlan(plan: BatchBuyPlan): BatchBuyResult[] {
    const results: BatchBuyResult[] = [];
    const { totalAmount, batches, strategy, priceRange } = plan;

    const amounts = this.calculateAmounts(totalAmount, batches, strategy);
    const prices = this.calculatePrices(priceRange, batches);

    let cumAmount = 0;
    let cumShares = 0;

    for (let i = 0; i < batches; i++) {
      const amount = amounts[i];
      const price = prices[i];
      const shares = Math.floor(amount / price / 100) * 100;
      const actualAmount = shares * price;

      cumAmount += actualAmount;
      cumShares += shares;

      results.push({
        batch: i + 1,
        price: Math.round(price * 100) / 100,
        amount: Math.round(actualAmount * 100) / 100,
        shares,
        cumAmount: Math.round(cumAmount * 100) / 100,
        cumShares,
        avgCost: Math.round((cumAmount / cumShares) * 100) / 100,
      });
    }

    return results;
  }

  // 计算每批金额
  private calculateAmounts(total: number, batches: number, strategy: string): number[] {
    const amounts: number[] = [];

    if (strategy === 'equal') {
      const each = total / batches;
      for (let i = 0; i < batches; i++) {
        amounts.push(each);
      }
    } else if (strategy === 'pyramid') {
      // 金字塔：越跌买越多
      let sum = 0;
      for (let i = 1; i <= batches; i++) sum += i;
      for (let i = 1; i <= batches; i++) {
        amounts.push((total * i) / sum);
      }
    } else {
      // 倒金字塔：先多后少
      let sum = 0;
      for (let i = 1; i <= batches; i++) sum += i;
      for (let i = batches; i >= 1; i--) {
        amounts.push((total * i) / sum);
      }
    }

    return amounts;
  }

  // 计算每批价格
  private calculatePrices(range: { high: number; low: number }, batches: number): number[] {
    const prices: number[] = [];
    const step = (range.high - range.low) / (batches - 1 || 1);

    for (let i = 0; i < batches; i++) {
      prices.push(range.high - step * i);
    }

    return prices;
  }
}

export const batchBuyService = new BatchBuyService();
