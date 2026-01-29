import { PrismaClient } from '@prisma/client';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface CalendarEvent {
  date: string;
  type: 'earnings' | 'dividend' | 'ipo' | 'holiday' | 'custom';
  stockCode?: string;
  stockName?: string;
  title: string;
  description?: string;
}

class TradingCalendarService {
  // 获取指定日期范围的事件
  async getEvents(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];

    const [holidays, userEvents, dividends] = await Promise.all([
      this.getHolidays(startDate, endDate),
      this.getUserEvents(userId, startDate, endDate),
      this.getDividendEvents(userId, startDate, endDate),
    ]);

    events.push(...holidays, ...userEvents, ...dividends);
    return events.sort((a, b) => a.date.localeCompare(b.date));
  }

  // 获取节假日
  private async getHolidays(start: Date, end: Date): Promise<CalendarEvent[]> {
    const year = start.getFullYear();
    const holidays: CalendarEvent[] = [
      { date: `${year}-01-01`, type: 'holiday', title: '元旦' },
      { date: `${year}-05-01`, type: 'holiday', title: '劳动节' },
      { date: `${year}-10-01`, type: 'holiday', title: '国庆节' },
    ];

    return holidays.filter(h => h.date >= start.toISOString().split('T')[0] && h.date <= end.toISOString().split('T')[0]);
  }

  // 获取用户自定义事件
  private async getUserEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
    });

    return events.map(e => ({
      date: e.date.toISOString().split('T')[0],
      type: 'custom' as const,
      stockCode: e.stockCode || undefined,
      stockName: e.stockName || undefined,
      title: e.title,
      description: e.description || undefined,
    }));
  }

  // 获取分红事件
  private async getDividendEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const dividends = await prisma.dividendRecord.findMany({
      where: {
        userId,
        exDate: { gte: start, lte: end },
      },
    });

    return dividends.map((d: any) => ({
      date: d.exDate.toISOString().split('T')[0],
      type: 'dividend' as const,
      stockCode: d.stockCode,
      stockName: d.stockName,
      title: `${d.stockName} 除权除息`,
      description: `每股派息 ${d.amount} 元`,
    }));
  }
}

export const tradingCalendarService = new TradingCalendarService();
