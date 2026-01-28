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
