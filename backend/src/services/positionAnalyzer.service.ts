import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PositionAnalysis {
  stockCode: string;
  stockName: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  profit: number;
  profitRate: number;
  holdingDays: number;
}

export interface PortfolioSummary {
  totalCost: number;
  totalMarketValue: number;
  totalProfit: number;
  totalProfitRate: number;
  positions: PositionAnalysis[];
}

export class PositionAnalyzer {
  static async analyze(userId: string, currentPrices: Map<string, number>): Promise<PortfolioSummary> {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { tradeTime: 'asc' },
    });

    const holdings = new Map<string, { qty: number; cost: number; name: string; firstBuy: Date }>();

    for (const trade of trades) {
      const key = trade.stockCode;
      const current = holdings.get(key) || { qty: 0, cost: 0, name: trade.stockName, firstBuy: trade.tradeTime };

      if (trade.type === 'buy') {
        current.cost += trade.price * trade.quantity;
        current.qty += trade.quantity;
      } else {
        const avgCost = current.qty > 0 ? current.cost / current.qty : 0;
        current.cost -= avgCost * trade.quantity;
        current.qty -= trade.quantity;
      }

      if (current.qty > 0) {
        holdings.set(key, current);
      } else {
        holdings.delete(key);
      }
    }

    const positions: PositionAnalysis[] = [];
    let totalCost = 0;
    let totalMarketValue = 0;

    for (const [code, holding] of holdings) {
      const currentPrice = currentPrices.get(code) || 0;
      const avgCost = holding.cost / holding.qty;
      const marketValue = currentPrice * holding.qty;
      const profit = marketValue - holding.cost;
      const profitRate = holding.cost > 0 ? (profit / holding.cost) * 100 : 0;
      const holdingDays = Math.floor((Date.now() - holding.firstBuy.getTime()) / 86400000);

      positions.push({
        stockCode: code,
        stockName: holding.name,
        quantity: holding.qty,
        avgCost: Math.round(avgCost * 100) / 100,
        currentPrice,
        marketValue: Math.round(marketValue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitRate: Math.round(profitRate * 100) / 100,
        holdingDays,
      });

      totalCost += holding.cost;
      totalMarketValue += marketValue;
    }

    const totalProfit = totalMarketValue - totalCost;
    const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalMarketValue: Math.round(totalMarketValue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalProfitRate: Math.round(totalProfitRate * 100) / 100,
      positions: positions.sort((a, b) => b.marketValue - a.marketValue),
    };
  }
}
