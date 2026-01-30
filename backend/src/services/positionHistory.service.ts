import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface PositionSnapshot {
  date: string;
  positions: { stockCode: string; stockName: string; value: number }[];
  totalValue: number;
}

class PositionHistoryService {
  async getSnapshots(userId: string, days: number = 30): Promise<PositionSnapshot[]> {
    try {
      const diaries = await prisma.diary.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        take: days,
        select: { date: true, totalAssets: true },
      });

      return diaries.map(d => ({
        date: d.date.toISOString().split('T')[0],
        positions: [],
        totalValue: Number(d.totalAssets) || 0,
      }));
    } catch (error) {
      logger.error('Position history error:', error);
      return [];
    }
  }
}

export const positionHistoryService = new PositionHistoryService();
