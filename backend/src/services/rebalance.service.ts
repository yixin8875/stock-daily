// 智能调仓建议服务
import axios from 'axios';

interface Position {
  stockCode: string;
  stockName: string;
  shares: number;
  costPrice: number;
  currentPrice: number;
  weight: number;
}

interface RebalanceSuggestion {
  stockCode: string;
  stockName: string;
  action: 'buy' | 'sell' | 'hold';
  currentWeight: number;
  targetWeight: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

class RebalanceService {
  // 生成调仓建议
  async generateSuggestions(positions: Position[]): Promise<RebalanceSuggestion[]> {
    const suggestions: RebalanceSuggestion[] = [];
    const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.shares, 0);

    for (const pos of positions) {
      const currentWeight = (pos.currentPrice * pos.shares) / totalValue * 100;
      const profitRate = (pos.currentPrice - pos.costPrice) / pos.costPrice * 100;

      // 获取技术指标判断
      const technical = await this.getTechnicalSignal(pos.stockCode);

      let action: 'buy' | 'sell' | 'hold' = 'hold';
      let targetWeight = currentWeight;
      let reason = '';
      let priority: 'high' | 'medium' | 'low' = 'low';

      // 止盈建议
      if (profitRate > 30) {
        action = 'sell';
        targetWeight = currentWeight * 0.5;
        reason = `盈利${profitRate.toFixed(1)}%，建议止盈减仓`;
        priority = 'high';
      }
      // 止损建议
      else if (profitRate < -15) {
        action = 'sell';
        targetWeight = currentWeight * 0.3;
        reason = `亏损${Math.abs(profitRate).toFixed(1)}%，建议止损`;
        priority = 'high';
      }
      // 仓位过重
      else if (currentWeight > 30) {
        action = 'sell';
        targetWeight = 25;
        reason = `单只持仓${currentWeight.toFixed(1)}%过重，建议分散`;
        priority = 'medium';
      }
      // 技术面看空
      else if (technical.signal === 'sell') {
        action = 'sell';
        targetWeight = currentWeight * 0.7;
        reason = `技术指标转弱：${technical.reason}`;
        priority = 'medium';
      }
      // 技术面看多且仓位轻
      else if (technical.signal === 'buy' && currentWeight < 10) {
        action = 'buy';
        targetWeight = currentWeight * 1.5;
        reason = `技术指标向好：${technical.reason}`;
        priority = 'low';
      }

      if (action !== 'hold') {
        suggestions.push({
          stockCode: pos.stockCode,
          stockName: pos.stockName,
          action,
          currentWeight,
          targetWeight,
          reason,
          priority,
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // 获取技术信号
  private async getTechnicalSignal(stockCode: string): Promise<{ signal: string; reason: string }> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${market}.${stockCode}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56&klt=101&fqt=1&end=20500101&lmt=30`;

      const response = await axios.get(url);
      const klines = response.data?.data?.klines || [];

      if (klines.length < 20) {
        return { signal: 'hold', reason: '数据不足' };
      }

      const closes = klines.map((k: string) => parseFloat(k.split(',')[2]));
      const ma5 = this.calculateMA(closes, 5);
      const ma20 = this.calculateMA(closes, 20);
      const currentPrice = closes[closes.length - 1];

      if (currentPrice > ma5 && ma5 > ma20) {
        return { signal: 'buy', reason: '均线多头排列' };
      } else if (currentPrice < ma5 && ma5 < ma20) {
        return { signal: 'sell', reason: '均线空头排列' };
      }

      return { signal: 'hold', reason: '趋势不明' };
    } catch {
      return { signal: 'hold', reason: '获取数据失败' };
    }
  }

  private calculateMA(data: number[], period: number): number {
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }
}

export const rebalanceService = new RebalanceService();
