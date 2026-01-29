import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface KLineRecord {
  stockCode: string;
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

class HistorySyncService {
  // 从东方财富获取历史K线数据
  async fetchKLineHistory(
    stockCode: string,
    days: number = 120
  ): Promise<KLineRecord[]> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const secid = `${market}.${stockCode}`;

      const response = await axios.get(
        'https://push2his.eastmoney.com/api/qt/stock/kline/get',
        {
          params: {
            secid,
            fields1: 'f1,f2,f3,f4,f5,f6',
            fields2: 'f51,f52,f53,f54,f55,f56,f57',
            klt: 101, // 日K
            fqt: 1,   // 前复权
            end: '20500101',
            lmt: days,
          },
        }
      );

      const data = response.data;
      if (!data.data?.klines) {
        return [];
      }

      return data.data.klines.map((line: string) => {
        const [date, open, close, high, low, volume, amount] = line.split(',');
        return {
          stockCode,
          date,
          open: parseFloat(open),
          close: parseFloat(close),
          high: parseFloat(high),
          low: parseFloat(low),
          volume: parseInt(volume),
          amount: parseFloat(amount),
        };
      });
    } catch (error) {
      logger.error(`Failed to fetch kline for ${stockCode}:`, error);
      return [];
    }
  }

  // 同步单只股票的历史数据到缓存
  async syncStockHistory(stockCode: string, days: number = 120): Promise<number> {
    const klines = await this.fetchKLineHistory(stockCode, days);
    if (klines.length === 0) return 0;

    const cacheKey = `kline:${stockCode}:daily`;
    await cacheService.set(cacheKey, klines, 86400); // 缓存1天

    logger.info(`Synced ${klines.length} klines for ${stockCode}`);
    return klines.length;
  }

  // 同步用户自选股的历史数据
  async syncWatchlistHistory(userId: string): Promise<{ total: number; synced: number }> {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      select: { stockCode: true },
    });

    let synced = 0;
    for (const stock of watchlist) {
      const count = await this.syncStockHistory(stock.stockCode);
      if (count > 0) synced++;
    }

    return { total: watchlist.length, synced };
  }

  // 同步用户持仓股票的历史数据
  async syncPositionHistory(userId: string): Promise<{ total: number; synced: number }> {
    const positions = await prisma.position.findMany({
      where: { userId },
      select: { stockCode: true },
    });

    let synced = 0;
    for (const pos of positions) {
      const count = await this.syncStockHistory(pos.stockCode);
      if (count > 0) synced++;
    }

    return { total: positions.length, synced };
  }

  // 获取缓存的历史数据
  async getCachedHistory(stockCode: string): Promise<KLineRecord[] | null> {
    const cacheKey = `kline:${stockCode}:daily`;
    return cacheService.get<KLineRecord[]>(cacheKey);
  }
}

export const historySyncService = new HistorySyncService();
