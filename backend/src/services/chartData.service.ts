import { cacheService } from './cache.service';
import { logger } from './logger.service';

interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  turnover?: number;
}

interface MoneyFlowData {
  date: string;
  mainIn: number;
  mainOut: number;
  mainNet: number;
  retailIn: number;
  retailOut: number;
  retailNet: number;
}

interface TrendData {
  time: string;
  price: number;
  avgPrice: number;
  volume: number;
}

class ChartDataService {
  // 获取K线数据
  async getKLineData(
    stockCode: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    limit: number = 120
  ): Promise<KLineData[]> {
    const cacheKey = `kline:${stockCode}:${period}:${limit}`;
    const cached = await cacheService.get<KLineData[]>(cacheKey);
    if (cached) return cached;

    try {
      const klt = period === 'daily' ? 101 : period === 'weekly' ? 102 : 103;
      const secId = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;

      const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secId}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=${klt}&fqt=1&lmt=${limit}`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.klines) return [];

      const klines: KLineData[] = data.data.klines.map((line: string) => {
        const parts = line.split(',');
        return {
          date: parts[0],
          open: parseFloat(parts[1]),
          close: parseFloat(parts[2]),
          high: parseFloat(parts[3]),
          low: parseFloat(parts[4]),
          volume: parseInt(parts[5]),
          amount: parseFloat(parts[6]),
          turnover: parseFloat(parts[10]) || 0,
        };
      });

      await cacheService.set(cacheKey, klines, 300);
      return klines;
    } catch (error) {
      logger.error('Fetch KLine error:', error);
      return [];
    }
  }

  // 获取分时数据
  async getTrendData(stockCode: string): Promise<TrendData[]> {
    const cacheKey = `trend:${stockCode}`;
    const cached = await cacheService.get<TrendData[]>(cacheKey);
    if (cached) return cached;

    try {
      const secId = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
      const url = `https://push2.eastmoney.com/api/qt/stock/trends2/get?secid=${secId}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56,f57,f58`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.trends) return [];

      const trends: TrendData[] = data.data.trends.map((line: string) => {
        const parts = line.split(',');
        return {
          time: parts[0],
          price: parseFloat(parts[2]),
          avgPrice: parseFloat(parts[7]) || parseFloat(parts[2]),
          volume: parseInt(parts[5]) || 0,
        };
      });

      await cacheService.set(cacheKey, trends, 60);
      return trends;
    } catch (error) {
      logger.error('Fetch trend error:', error);
      return [];
    }
  }
}

export const chartDataService = new ChartDataService();
