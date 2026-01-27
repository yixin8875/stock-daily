import { PrismaClient, TradeDirection } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface BacktestResult {
  strategyName: string;
  period: { start: string; end: string };
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalProfitRate: number;
  maxDrawdown: number;
  maxDrawdownRate: number;
  profitFactor: number;
  avgProfit: number;
  avgLoss: number;
  avgHoldingDays: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  stockCode: string;
  stockName: string;
  buyDate: string;
  buyPrice: number;
  sellDate: string;
  sellPrice: number;
  profit: number;
  profitRate: number;
  holdingDays: number;
}

interface TradeWithDate {
  id: string;
  stockCode: string;
  stockName: string;
  direction: TradeDirection;
  price: Decimal;
  quantity: number;
  tradeDate: Date;
}

export class BacktestService {
  /**
   * 基于历史交易数据进行策略回测
   */
  static async runBacktest(
    userId: string,
    strategyType: string,
    startDate?: string,
    endDate?: string
  ): Promise<BacktestResult> {
    // 获取用户历史交易记录（通过diary关联）
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        trades: true,
      },
      orderBy: { date: 'asc' },
    });

    // 将交易记录展平并添加日期
    const trades: TradeWithDate[] = [];
    diaries.forEach(diary => {
      diary.trades.forEach(trade => {
        trades.push({
          id: trade.id,
          stockCode: trade.stockCode,
          stockName: trade.stockName,
          direction: trade.direction,
          price: trade.price,
          quantity: trade.quantity,
          tradeDate: diary.date,
        });
      });
    });

    // 按股票分组交易
    const stockTrades = new Map<string, TradeWithDate[]>();
    trades.forEach(trade => {
      const key = trade.stockCode;
      if (!stockTrades.has(key)) {
        stockTrades.set(key, []);
      }
      stockTrades.get(key)!.push(trade);
    });

    // 分析每只股票的买卖配对
    const backtestTrades: BacktestTrade[] = [];
    let totalProfit = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    stockTrades.forEach((stockTradeList) => {
      const buys = stockTradeList.filter(t => t.direction === 'BUY');
      const sells = stockTradeList.filter(t => t.direction === 'SELL');

      // 简单配对：按时间顺序匹配买卖
      let buyIndex = 0;
      let sellIndex = 0;

      while (buyIndex < buys.length && sellIndex < sells.length) {
        const buy = buys[buyIndex];
        const sell = sells[sellIndex];

        if (sell.tradeDate >= buy.tradeDate) {
          const buyPrice = Number(buy.price);
          const sellPrice = Number(sell.price);
          const profit = (sellPrice - buyPrice) * Math.min(buy.quantity, sell.quantity);
          const profitRate = ((sellPrice - buyPrice) / buyPrice) * 100;
          const holdingDays = Math.ceil(
            (sell.tradeDate.getTime() - buy.tradeDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          backtestTrades.push({
            stockCode: buy.stockCode,
            stockName: buy.stockName,
            buyDate: buy.tradeDate.toISOString().split('T')[0],
            buyPrice,
            sellDate: sell.tradeDate.toISOString().split('T')[0],
            sellPrice,
            profit: Math.round(profit * 100) / 100,
            profitRate: Math.round(profitRate * 100) / 100,
            holdingDays,
          });

          totalProfit += profit;
          if (profit > 0) {
            totalWins++;
            grossProfit += profit;
          } else {
            totalLosses++;
            grossLoss += Math.abs(profit);
          }

          buyIndex++;
          sellIndex++;
        } else {
          sellIndex++;
        }
      }
    });

    // 计算回撤
    let peak = 0;
    let maxDrawdown = 0;
    let runningProfit = 0;

    backtestTrades.forEach(trade => {
      runningProfit += trade.profit;
      if (runningProfit > peak) {
        peak = runningProfit;
      }
      const drawdown = peak - runningProfit;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    const totalTrades = backtestTrades.length;
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const avgProfit = totalWins > 0 ? grossProfit / totalWins : 0;
    const avgLoss = totalLosses > 0 ? grossLoss / totalLosses : 0;
    const avgHoldingDays = totalTrades > 0
      ? backtestTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades
      : 0;

    // 计算总收益率（基于初始资金假设为100000）
    const initialCapital = 100000;
    const totalProfitRate = (totalProfit / initialCapital) * 100;
    const maxDrawdownRate = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    // 获取日期范围
    const firstDate = trades[0]?.tradeDate.toISOString().split('T')[0] || '';
    const lastDate = trades[trades.length - 1]?.tradeDate.toISOString().split('T')[0] || '';

    return {
      strategyName: this.getStrategyName(strategyType),
      period: {
        start: startDate || firstDate,
        end: endDate || lastDate,
      },
      totalTrades,
      winningTrades: totalWins,
      losingTrades: totalLosses,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalProfitRate: Math.round(totalProfitRate * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownRate: Math.round(maxDrawdownRate * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgProfit: Math.round(avgProfit * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      avgHoldingDays: Math.round(avgHoldingDays * 10) / 10,
      trades: backtestTrades,
    };
  }

  private static getStrategyName(strategyType: string): string {
    const names: Record<string, string> = {
      all: '全部交易',
      trend: '趋势跟踪',
      swing: '波段交易',
      value: '价值投资',
    };
    return names[strategyType] || '自定义策略';
  }
}
