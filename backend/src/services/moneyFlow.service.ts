import { cacheService } from './cache.service';
import { logger } from './logger.service';

interface MoneyFlowData {
  date: string;
  mainIn: number;
  mainOut: number;
  mainNet: number;
  superIn: number;
  superOut: number;
  bigIn: number;
  bigOut: number;
  midIn: number;
  midOut: number;
  smallIn: number;
  smallOut: number;
}

interface RealtimeFlow {
  code: string;
  name: string;
  mainNet: number;
  mainNetPercent: number;
  superNet: number;
  bigNet: number;
  midNet: number;
  smallNet: number;
}

class MoneyFlowService {
  // 获取个股资金流向历史
  async getStockMoneyFlow(stockCode: string, days: number = 30): Promise<MoneyFlowData[]> {
    const cacheKey = `moneyflow:${stockCode}:${days}`;
    const cached = await cacheService.get<MoneyFlowData[]>(cacheKey);
    if (cached) return cached;

    try {
      const secId = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
      const url = `https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?secid=${secId}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63&lmt=${days}`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.klines) return [];

      const flows: MoneyFlowData[] = data.data.klines.map((line: string) => {
        const p = line.split(',');
        return {
          date: p[0],
          mainIn: parseFloat(p[1]) || 0,
          mainOut: parseFloat(p[2]) || 0,
          mainNet: parseFloat(p[3]) || 0,
          superIn: parseFloat(p[5]) || 0,
          superOut: parseFloat(p[6]) || 0,
          bigIn: parseFloat(p[7]) || 0,
          bigOut: parseFloat(p[8]) || 0,
          midIn: parseFloat(p[9]) || 0,
          midOut: parseFloat(p[10]) || 0,
          smallIn: parseFloat(p[11]) || 0,
          smallOut: parseFloat(p[12]) || 0,
        };
      });

      await cacheService.set(cacheKey, flows, 600);
      return flows;
    } catch (error) {
      logger.error('Fetch money flow error:', error);
      return [];
    }
  }

  // 获取实时资金流向
  async getRealtimeFlow(stockCode: string): Promise<RealtimeFlow | null> {
    try {
      const secId = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
      const url = `https://push2.eastmoney.com/api/qt/stock/fflow/kline/get?secid=${secId}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63&lmt=1`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data) return null;

      return {
        code: stockCode,
        name: data.data.name || '',
        mainNet: data.data.f62 || 0,
        mainNetPercent: data.data.f184 || 0,
        superNet: data.data.f66 || 0,
        bigNet: data.data.f72 || 0,
        midNet: data.data.f78 || 0,
        smallNet: data.data.f84 || 0,
      };
    } catch (error) {
      logger.error('Fetch realtime flow error:', error);
      return null;
    }
  }

  // 获取板块资金流向
  async getSectorMoneyFlow(limit: number = 20): Promise<any[]> {
    const cacheKey = `sector:moneyflow:${limit}`;
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=${limit}&fs=m:90+t:2&fields=f12,f14,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.diff) return [];

      const flows = data.data.diff.map((item: any) => ({
        code: item.f12,
        name: item.f14,
        mainNet: item.f62,
        mainNetPercent: item.f184,
        superNet: item.f66,
        bigNet: item.f72,
        midNet: item.f78,
        smallNet: item.f84,
      }));

      await cacheService.set(cacheKey, flows, 300);
      return flows;
    } catch (error) {
      logger.error('Fetch sector flow error:', error);
      return [];
    }
  }
}

export const moneyFlowService = new MoneyFlowService();
