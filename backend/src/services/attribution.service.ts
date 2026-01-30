// 持仓归因分析服务
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AttributionResult {
  totalReturn: number;
  sectorAttribution: { sector: string; contribution: number; weight: number }[];
  stockAttribution: { stockCode: string; stockName: string; contribution: number }[];
  timingAttribution: { period: string; contribution: number }[];
}

class AttributionService {
  async analyzeAttribution(userId: string, days: number = 30): Promise<AttributionResult> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
      include: { trades: true },
      orderBy: { date: 'asc' },
    });

    const trades = diaries.flatMap(d =>
      d.trades.map(t => ({ ...t, date: d.date }))
    );

    const totalReturn = this.calcTotalReturn(trades);
    const sectorAttribution = this.calcSectorAttribution(trades);
    const stockAttribution = this.calcStockAttribution(trades);
    const timingAttribution = this.calcTimingAttribution(trades);

    return { totalReturn, sectorAttribution, stockAttribution, timingAttribution };
  }

  private calcTotalReturn(trades: any[]): number {
    let totalPnL = 0;
    let totalCost = 0;
    for (const t of trades) {
      if (t.direction === 'BUY') {
        totalCost += Number(t.amount);
      } else {
        totalPnL += Number(t.amount);
      }
    }
    return totalCost > 0 ? ((totalPnL - totalCost) / totalCost) * 100 : 0;
  }

  private calcSectorAttribution(trades: any[]) {
    const sectorPnL = new Map<string, { pnl: number; cost: number }>();

    for (const t of trades) {
      const sector = this.getSector(t.stockCode);
      const data = sectorPnL.get(sector) || { pnl: 0, cost: 0 };
      if (t.direction === 'BUY') {
        data.cost += Number(t.amount);
      } else {
        data.pnl += Number(t.amount) * 0.02;
      }
      sectorPnL.set(sector, data);
    }

    const totalCost = Array.from(sectorPnL.values()).reduce((s, d) => s + d.cost, 0);

    return Array.from(sectorPnL.entries()).map(([sector, data]) => ({
      sector,
      contribution: data.cost > 0 ? (data.pnl / data.cost) * 100 : 0,
      weight: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
    })).sort((a, b) => b.contribution - a.contribution);
  }

  private calcStockAttribution(trades: any[]) {
    const stockPnL = new Map<string, { name: string; pnl: number }>();

    for (const t of trades) {
      const data = stockPnL.get(t.stockCode) || { name: t.stockName || t.stockCode, pnl: 0 };
      const pnl = t.direction === 'SELL' ? Number(t.amount) * 0.02 : 0;
      data.pnl += pnl;
      stockPnL.set(t.stockCode, data);
    }

    return Array.from(stockPnL.entries())
      .map(([stockCode, data]) => ({
        stockCode,
        stockName: data.name,
        contribution: data.pnl,
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 10);
  }

  private calcTimingAttribution(trades: any[]) {
    const periods = [
      { period: '开盘30分钟', start: 9, end: 10 },
      { period: '上午盘中', start: 10, end: 11.5 },
      { period: '下午开盘', start: 13, end: 14 },
      { period: '尾盘', start: 14, end: 15 },
    ];

    return periods.map(p => {
      const periodTrades = trades.filter(t => {
        const h = t.createdAt.getHours() + t.createdAt.getMinutes() / 60;
        return h >= p.start && h < p.end;
      });
      const pnl = periodTrades.reduce((s, t) =>
        s + (t.direction === 'SELL' ? Number(t.amount) * 0.02 : 0), 0);
      return { period: p.period, contribution: pnl };
    });
  }

  private getSector(code: string): string {
    const prefix = code.substring(0, 3);
    const map: Record<string, string> = {
      '600': '沪市主板', '601': '沪市主板', '603': '沪市主板',
      '000': '深市主板', '002': '中小板', '300': '创业板', '688': '科创板',
    };
    return map[prefix] || '其他';
  }
}

export const attributionService = new AttributionService();
