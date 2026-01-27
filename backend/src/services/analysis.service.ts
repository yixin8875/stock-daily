import { PrismaClient, TradeDirection } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export interface ProfitPoint {
  date: string;
  profit: number;
  profitRate: number;
  cumulativeProfit: number;
  cumulativeProfitRate: number;
}

export interface TradeReview {
  id: string;
  stockCode: string;
  stockName: string;
  buyDate: string;
  buyPrice: number;
  buyQuantity: number;
  buyReason: string | null;
  sellDate: string | null;
  sellPrice: number | null;
  sellQuantity: number | null;
  sellReason: string | null;
  holdingDays: number;
  profit: number | null;
  profitRate: number | null;
  status: 'open' | 'closed';
}

export interface PeriodReport {
  period: { start: string; end: string };
  summary: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    avgProfit: number;
    avgLoss: number;
    maxProfit: number;
    maxLoss: number;
    profitFactor: number;
  };
  dailyProfits: ProfitPoint[];
  topWinners: TradeReview[];
  topLosers: TradeReview[];
  stockStats: {
    stockCode: string;
    stockName: string;
    tradeCount: number;
    profit: number;
    winRate: number;
  }[];
}

export class AnalysisService {
  /**
   * 获取收益曲线数据
   */
  static async getProfitCurve(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProfitPoint[]> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        profitLossAmount: true,
        profitLossPercent: true,
        totalAssets: true,
      },
    });

    let cumulativeProfit = 0;
    const initialAssets = 100000;

    return diaries.map(diary => {
      const profit = Number(diary.profitLossAmount || 0);
      const profitRate = Number(diary.profitLossPercent || 0);
      cumulativeProfit += profit;
      const cumulativeProfitRate = (cumulativeProfit / initialAssets) * 100;

      return {
        date: dayjs(diary.date).format('YYYY-MM-DD'),
        profit: Math.round(profit * 100) / 100,
        profitRate: Math.round(profitRate * 100) / 100,
        cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
        cumulativeProfitRate: Math.round(cumulativeProfitRate * 100) / 100,
      };
    });
  }

  /**
   * 获取交易复盘数据
   */
  static async getTradeReviews(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TradeReview[]> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: { trades: true },
      orderBy: { date: 'asc' },
    });

    // 按股票分组交易
    const stockTrades = new Map<string, any[]>();
    diaries.forEach(diary => {
      diary.trades.forEach(trade => {
        const key = trade.stockCode;
        if (!stockTrades.has(key)) {
          stockTrades.set(key, []);
        }
        stockTrades.get(key)!.push({
          ...trade,
          tradeDate: diary.date,
        });
      });
    });

    const reviews: TradeReview[] = [];

    stockTrades.forEach((trades, stockCode) => {
      const buys = trades.filter(t => t.direction === 'BUY').sort((a, b) => 
        new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
      );
      const sells = trades.filter(t => t.direction === 'SELL').sort((a, b) => 
        new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
      );

      let buyIndex = 0;
      let sellIndex = 0;

      while (buyIndex < buys.length) {
        const buy = buys[buyIndex];
        const sell = sellIndex < sells.length && sells[sellIndex].tradeDate >= buy.tradeDate
          ? sells[sellIndex]
          : null;

        const buyDate = dayjs(buy.tradeDate);
        const sellDate = sell ? dayjs(sell.tradeDate) : dayjs();
        const holdingDays = sellDate.diff(buyDate, 'day');

        let profit = null;
        let profitRate = null;
        if (sell) {
          const buyPrice = Number(buy.price);
          const sellPrice = Number(sell.price);
          const quantity = Math.min(buy.quantity, sell.quantity);
          profit = (sellPrice - buyPrice) * quantity;
          profitRate = ((sellPrice - buyPrice) / buyPrice) * 100;
        }

        reviews.push({
          id: buy.id,
          stockCode: buy.stockCode,
          stockName: buy.stockName,
          buyDate: buyDate.format('YYYY-MM-DD'),
          buyPrice: Number(buy.price),
          buyQuantity: buy.quantity,
          buyReason: buy.reason,
          sellDate: sell ? sellDate.format('YYYY-MM-DD') : null,
          sellPrice: sell ? Number(sell.price) : null,
          sellQuantity: sell ? sell.quantity : null,
          sellReason: sell ? sell.reason : null,
          holdingDays,
          profit: profit !== null ? Math.round(profit * 100) / 100 : null,
          profitRate: profitRate !== null ? Math.round(profitRate * 100) / 100 : null,
          status: sell ? 'closed' : 'open',
        });

        buyIndex++;
        if (sell) sellIndex++;
      }
    });

    return reviews.sort((a, b) => 
      new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime()
    );
  }

  /**
   * 生成周报/月报
   */
  static async generateReport(
    userId: string,
    periodType: 'week' | 'month',
    date?: string
  ): Promise<PeriodReport> {
    const targetDate = date ? dayjs(date) : dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;

    if (periodType === 'week') {
      startDate = targetDate.startOf('week');
      endDate = targetDate.endOf('week');
    } else {
      startDate = targetDate.startOf('month');
      endDate = targetDate.endOf('month');
    }

    const startStr = startDate.format('YYYY-MM-DD');
    const endStr = endDate.format('YYYY-MM-DD');

    // 获取收益曲线
    const dailyProfits = await this.getProfitCurve(userId, startStr, endStr);

    // 获取交易复盘
    const reviews = await this.getTradeReviews(userId, startStr, endStr);
    const closedTrades = reviews.filter(r => r.status === 'closed');

    // 计算统计数据
    const winningTrades = closedTrades.filter(t => (t.profit || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.profit || 0) < 0);

    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0));

    const profits = closedTrades.map(t => t.profit || 0);
    const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;
    const maxLoss = profits.length > 0 ? Math.min(...profits) : 0;

    // 按股票统计
    const stockStatsMap = new Map<string, any>();
    closedTrades.forEach(trade => {
      const key = trade.stockCode;
      if (!stockStatsMap.has(key)) {
        stockStatsMap.set(key, {
          stockCode: trade.stockCode,
          stockName: trade.stockName,
          tradeCount: 0,
          profit: 0,
          wins: 0,
        });
      }
      const stats = stockStatsMap.get(key)!;
      stats.tradeCount++;
      stats.profit += trade.profit || 0;
      if ((trade.profit || 0) > 0) stats.wins++;
    });

    const stockStats = Array.from(stockStatsMap.values()).map(s => ({
      ...s,
      profit: Math.round(s.profit * 100) / 100,
      winRate: s.tradeCount > 0 ? Math.round((s.wins / s.tradeCount) * 10000) / 100 : 0,
    }));

    return {
      period: { start: startStr, end: endStr },
      summary: {
        totalTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: closedTrades.length > 0
          ? Math.round((winningTrades.length / closedTrades.length) * 10000) / 100
          : 0,
        totalProfit: Math.round(totalProfit * 100) / 100,
        avgProfit: winningTrades.length > 0
          ? Math.round((grossProfit / winningTrades.length) * 100) / 100
          : 0,
        avgLoss: losingTrades.length > 0
          ? Math.round((grossLoss / losingTrades.length) * 100) / 100
          : 0,
        maxProfit: Math.round(maxProfit * 100) / 100,
        maxLoss: Math.round(maxLoss * 100) / 100,
        profitFactor: grossLoss > 0
          ? Math.round((grossProfit / grossLoss) * 100) / 100
          : grossProfit > 0 ? Infinity : 0,
      },
      dailyProfits,
      topWinners: closedTrades
        .filter(t => (t.profit || 0) > 0)
        .sort((a, b) => (b.profit || 0) - (a.profit || 0))
        .slice(0, 5),
      topLosers: closedTrades
        .filter(t => (t.profit || 0) < 0)
        .sort((a, b) => (a.profit || 0) - (b.profit || 0))
        .slice(0, 5),
      stockStats: stockStats.sort((a, b) => b.profit - a.profit),
    };
  }

  /**
   * 计算最大回撤
   */
  static calculateMaxDrawdown(profitCurve: ProfitPoint[]): {
    maxDrawdown: number;
    maxDrawdownRate: number;
    drawdownStart: string;
    drawdownEnd: string;
  } {
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownRate = 0;
    let drawdownStart = '';
    let drawdownEnd = '';
    let currentPeakDate = '';

    profitCurve.forEach(point => {
      if (point.cumulativeProfit > peak) {
        peak = point.cumulativeProfit;
        currentPeakDate = point.date;
      }
      const drawdown = peak - point.cumulativeProfit;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownRate = peak > 0 ? (drawdown / peak) * 100 : 0;
        drawdownStart = currentPeakDate;
        drawdownEnd = point.date;
      }
    });

    return {
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownRate: Math.round(maxDrawdownRate * 100) / 100,
      drawdownStart,
      drawdownEnd,
    };
  }
}
