// 交易热力图服务
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HeatmapCell {
  label: string;
  value: number;
  count: number;
}

interface TradeHeatmap {
  byHour: HeatmapCell[];
  byWeekday: HeatmapCell[];
  bySector: HeatmapCell[];
}

class TradeHeatmapService {
  // 生成交易热力图数据
  async generateHeatmap(userId: string, days: number = 30): Promise<TradeHeatmap> {
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
      include: { trades: true },
    });

    const trades = diaries.flatMap(d =>
      d.trades.map(t => ({ ...t, date: d.date }))
    );

    return {
      byHour: this.groupByHour(trades),
      byWeekday: this.groupByWeekday(trades),
      bySector: this.groupBySector(trades),
    };
  }

  private groupByHour(trades: any[]): HeatmapCell[] {
    const hours = Array.from({ length: 4 }, (_, i) => ({
      label: `${9 + i}:30`,
      value: 0,
      count: 0,
    }));

    for (const trade of trades) {
      const hour = trade.createdAt.getHours();
      const idx = Math.min(Math.max(hour - 9, 0), 3);
      hours[idx].count++;
      hours[idx].value += Number(trade.amount);
    }

    return hours;
  }

  private groupByWeekday(trades: any[]): HeatmapCell[] {
    const weekdays = ['周一', '周二', '周三', '周四', '周五'].map(label => ({
      label,
      value: 0,
      count: 0,
    }));

    for (const trade of trades) {
      const day = trade.date.getDay();
      if (day >= 1 && day <= 5) {
        weekdays[day - 1].count++;
        weekdays[day - 1].value += Number(trade.amount);
      }
    }

    return weekdays;
  }

  private groupBySector(trades: any[]): HeatmapCell[] {
    const sectorMap = new Map<string, { value: number; count: number }>();

    for (const trade of trades) {
      const sector = this.getSectorByCode(trade.stockCode);
      const existing = sectorMap.get(sector) || { value: 0, count: 0 };
      existing.count++;
      existing.value += Number(trade.amount);
      sectorMap.set(sector, existing);
    }

    return Array.from(sectorMap.entries())
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  private getSectorByCode(code: string): string {
    const prefix = code.substring(0, 3);
    const sectorMap: Record<string, string> = {
      '600': '主板',
      '601': '主板',
      '603': '主板',
      '000': '深主板',
      '002': '中小板',
      '300': '创业板',
      '688': '科创板',
    };
    return sectorMap[prefix] || '其他';
  }
}

export const tradeHeatmapService = new TradeHeatmapService();
