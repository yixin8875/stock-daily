// 智能止盈策略服务
import axios from 'axios';

interface TakeProfitStrategy {
  type: 'trailing' | 'staged' | 'target';
  name: string;
  description: string;
  params: Record<string, number>;
}

interface TakeProfitPlan {
  stockCode: string;
  stockName: string;
  costPrice: number;
  currentPrice: number;
  profitRate: number;
  strategy: TakeProfitStrategy;
  actions: { trigger: string; action: string; ratio: number }[];
}

class SmartTakeProfitService {
  // 生成止盈计划
  async generatePlan(
    stockCode: string,
    costPrice: number,
    shares: number
  ): Promise<TakeProfitPlan> {
    const currentPrice = await this.getCurrentPrice(stockCode);
    const stockName = await this.getStockName(stockCode);
    const profitRate = ((currentPrice - costPrice) / costPrice) * 100;

    // 根据盈利情况选择策略
    const strategy = this.selectStrategy(profitRate);
    const actions = this.generateActions(strategy, costPrice, currentPrice);

    return {
      stockCode,
      stockName,
      costPrice,
      currentPrice,
      profitRate,
      strategy,
      actions,
    };
  }

  private selectStrategy(profitRate: number): TakeProfitStrategy {
    if (profitRate > 30) {
      return {
        type: 'staged',
        name: '分批止盈',
        description: '盈利较高，建议分批锁定利润',
        params: { stage1: 30, stage2: 50, stage3: 70 },
      };
    } else if (profitRate > 10) {
      return {
        type: 'trailing',
        name: '移动止盈',
        description: '设置移动止盈保护利润',
        params: { trailPercent: 8 },
      };
    }
    return {
      type: 'target',
      name: '目标止盈',
      description: '设置目标价位止盈',
      params: { target1: 15, target2: 25 },
    };
  }

  private generateActions(
    strategy: TakeProfitStrategy,
    costPrice: number,
    currentPrice: number
  ) {
    const actions: { trigger: string; action: string; ratio: number }[] = [];

    if (strategy.type === 'staged') {
      actions.push(
        { trigger: `盈利${strategy.params.stage1}%`, action: '卖出', ratio: 30 },
        { trigger: `盈利${strategy.params.stage2}%`, action: '卖出', ratio: 30 },
        { trigger: `盈利${strategy.params.stage3}%`, action: '清仓', ratio: 40 }
      );
    } else if (strategy.type === 'trailing') {
      const trailPrice = currentPrice * (1 - strategy.params.trailPercent / 100);
      actions.push({
        trigger: `回撤${strategy.params.trailPercent}%至¥${trailPrice.toFixed(2)}`,
        action: '全部卖出',
        ratio: 100,
      });
    } else {
      actions.push(
        { trigger: `涨至¥${(costPrice * 1.15).toFixed(2)}`, action: '卖出', ratio: 50 },
        { trigger: `涨至¥${(costPrice * 1.25).toFixed(2)}`, action: '清仓', ratio: 50 }
      );
    }

    return actions;
  }

  private async getCurrentPrice(stockCode: string): Promise<number> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${stockCode}&fields=f43`;
      const res = await axios.get(url);
      return (res.data?.data?.f43 || 0) / 100;
    } catch {
      return 0;
    }
  }

  private async getStockName(stockCode: string): Promise<string> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${stockCode}&fields=f58`;
      const res = await axios.get(url);
      return res.data?.data?.f58 || stockCode;
    } catch {
      return stockCode;
    }
  }
}

export const smartTakeProfitService = new SmartTakeProfitService();
