import { logger } from './logger.service';

export interface BreakevenInput {
  costPrice: number;
  currentPrice: number;
  shares: number;
  targetDays?: number;
}

export interface BreakevenResult {
  lossAmount: number;
  lossPercent: number;
  breakevenPrice: number;
  requiredGain: number;
  scenarios: BreakevenScenario[];
}

export interface BreakevenScenario {
  method: string;
  description: string;
  action: string;
  newAvgCost: number;
  requiredGain: number;
}

class BreakevenService {
  // 计算解套分析
  analyze(input: BreakevenInput): BreakevenResult {
    const { costPrice, currentPrice, shares } = input;

    const lossAmount = (costPrice - currentPrice) * shares;
    const lossPercent = ((costPrice - currentPrice) / costPrice) * 100;
    const requiredGain = ((costPrice - currentPrice) / currentPrice) * 100;

    const scenarios = this.generateScenarios(input);

    return {
      lossAmount: Math.round(lossAmount * 100) / 100,
      lossPercent: Math.round(lossPercent * 100) / 100,
      breakevenPrice: costPrice,
      requiredGain: Math.round(requiredGain * 100) / 100,
      scenarios,
    };
  }

  // 生成解套方案
  private generateScenarios(input: BreakevenInput): BreakevenScenario[] {
    const { costPrice, currentPrice, shares } = input;
    const scenarios: BreakevenScenario[] = [];
    const lossAmount = (costPrice - currentPrice) * shares;

    // 方案1：持股等待
    scenarios.push({
      method: 'hold',
      description: '持股等待解套',
      action: `等待股价从${currentPrice}涨到${costPrice}`,
      newAvgCost: costPrice,
      requiredGain: Math.round(((costPrice - currentPrice) / currentPrice) * 10000) / 100,
    });

    // 方案2：补仓摊薄
    const addShares = shares;
    const totalCost = costPrice * shares + currentPrice * addShares;
    const totalShares = shares + addShares;
    const newAvgCost = totalCost / totalShares;

    scenarios.push({
      method: 'add_position',
      description: '等量补仓摊薄成本',
      action: `在${currentPrice}补仓${addShares}股`,
      newAvgCost: Math.round(newAvgCost * 100) / 100,
      requiredGain: Math.round(((newAvgCost - currentPrice) / currentPrice) * 10000) / 100,
    });

    // 方案3：T+0高抛低吸
    const tProfit = shares * currentPrice * 0.03;
    const tTimes = Math.ceil(lossAmount / tProfit);

    scenarios.push({
      method: 't_plus_0',
      description: 'T+0高抛低吸',
      action: `每次赚3%约${Math.round(tProfit)}元，需${tTimes}次`,
      newAvgCost: costPrice,
      requiredGain: 3,
    });

    // 方案4：止损换股
    scenarios.push({
      method: 'cut_loss',
      description: '止损换股',
      action: `卖出后换入更强势股票`,
      newAvgCost: currentPrice,
      requiredGain: 0,
    });

    return scenarios;
  }
}

export const breakevenService = new BreakevenService();
