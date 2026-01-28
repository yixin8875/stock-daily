import { KLineData } from './indicator.service';
import { SignalAnalyzer, TradeSignal } from './signalAnalyzer.service';

export interface BacktestConfig {
  initialCapital: number;
  positionSize: number; // 每次交易仓位比例 0-1
  stopLoss: number; // 止损比例
  takeProfit: number; // 止盈比例
  commission: number; // 手续费率
  slippage: number; // 滑点
}

export interface BacktestTrade {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  signal: string;
  profit?: number;
}

export interface BacktestResult {
  trades: BacktestTrade[];
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  totalProfit: number;
  totalProfitRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalCapital: number;
}

const defaultConfig: BacktestConfig = {
  initialCapital: 100000,
  positionSize: 0.3,
  stopLoss: 0.05,
  takeProfit: 0.1,
  commission: 0.0003,
  slippage: 0.001,
};

export class BacktestEngine {
  private config: BacktestConfig;
  private capital: number;
  private position: { qty: number; cost: number } | null = null;
  private trades: BacktestTrade[] = [];
  private capitalHistory: number[] = [];

  constructor(config: Partial<BacktestConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.capital = this.config.initialCapital;
  }

  run(klines: KLineData[]): BacktestResult {
    this.reset();

    for (let i = 30; i < klines.length; i++) {
      const slice = klines.slice(0, i + 1);
      const current = klines[i];
      this.capitalHistory.push(this.getEquity(current.close));

      if (this.position) {
        this.checkExit(current);
      } else {
        this.checkEntry(slice, current);
      }
    }

    return this.generateResult();
  }

  private reset() {
    this.capital = this.config.initialCapital;
    this.position = null;
    this.trades = [];
    this.capitalHistory = [];
  }

  private getEquity(price: number): number {
    if (!this.position) return this.capital;
    return this.capital + this.position.qty * price;
  }

  private checkEntry(klines: KLineData[], current: KLineData) {
    const signals = SignalAnalyzer.analyzeAll(klines);
    const buySignal = signals.find(s => s.type === 'buy' && s.strength !== 'weak');

    if (buySignal) {
      const price = current.close * (1 + this.config.slippage);
      const amount = this.capital * this.config.positionSize;
      const qty = Math.floor(amount / price / 100) * 100;

      if (qty > 0) {
        const cost = qty * price * (1 + this.config.commission);
        this.capital -= cost;
        this.position = { qty, cost: price };
        this.trades.push({
          date: current.date,
          type: 'buy',
          price,
          quantity: qty,
          signal: buySignal.reason,
        });
      }
    }
  }

  private checkExit(current: KLineData) {
    if (!this.position) return;

    const profitRate = (current.close - this.position.cost) / this.position.cost;
    let shouldSell = false;
    let reason = '';

    if (profitRate <= -this.config.stopLoss) {
      shouldSell = true;
      reason = '止损';
    } else if (profitRate >= this.config.takeProfit) {
      shouldSell = true;
      reason = '止盈';
    }

    if (shouldSell) {
      const price = current.close * (1 - this.config.slippage);
      const revenue = this.position.qty * price * (1 - this.config.commission);
      const profit = revenue - this.position.qty * this.position.cost;

      this.capital += revenue;
      this.trades.push({
        date: current.date,
        type: 'sell',
        price,
        quantity: this.position.qty,
        signal: reason,
        profit,
      });
      this.position = null;
    }
  }

  private generateResult(): BacktestResult {
    const sellTrades = this.trades.filter(t => t.type === 'sell');
    const winTrades = sellTrades.filter(t => (t.profit || 0) > 0).length;
    const lossTrades = sellTrades.filter(t => (t.profit || 0) < 0).length;
    const totalProfit = sellTrades.reduce((sum, t) => sum + (t.profit || 0), 0);

    const maxDrawdown = this.calcMaxDrawdown();
    const sharpeRatio = this.calcSharpeRatio();

    return {
      trades: this.trades,
      totalTrades: sellTrades.length,
      winTrades,
      lossTrades,
      winRate: sellTrades.length > 0 ? (winTrades / sellTrades.length) * 100 : 0,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalProfitRate: Math.round((totalProfit / this.config.initialCapital) * 10000) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      finalCapital: Math.round(this.capital * 100) / 100,
    };
  }

  private calcMaxDrawdown(): number {
    let maxDD = 0;
    let peak = this.capitalHistory[0] || 0;

    for (const val of this.capitalHistory) {
      if (val > peak) peak = val;
      const dd = (peak - val) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }

  private calcSharpeRatio(): number {
    if (this.capitalHistory.length < 2) return 0;
    const returns: number[] = [];
    for (let i = 1; i < this.capitalHistory.length; i++) {
      returns.push((this.capitalHistory[i] - this.capitalHistory[i - 1]) / this.capitalHistory[i - 1]);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const std = Math.sqrt(variance);
    return std > 0 ? (avgReturn / std) * Math.sqrt(252) : 0;
  }
}
