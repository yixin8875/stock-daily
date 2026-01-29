import { cacheService } from './cache.service';
import { logger } from './logger.service';

export interface NorthboundFlow {
  date: string;
  shConnect: number;
  szConnect: number;
  total: number;
  shBalance: number;
  szBalance: number;
}

export interface NorthboundHolding {
  stockCode: string;
  stockName: string;
  holdShares: number;
  holdMarketValue: number;
  holdRatio: number;
  changeShares: number;
  changeRatio: number;
}

class NorthboundService {
  // 获取北向资金实时流入
  async getRealTimeFlow(): Promise<NorthboundFlow | null> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/kamt.rtmin/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55,f56';

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data) return null;

      const s2n = data.data.s2n || [];
      const latest = s2n[s2n.length - 1];
      if (!latest) return null;

      const parts = latest.split(',');
      return {
        date: parts[0],
        shConnect: parseFloat(parts[1]) / 10000 || 0,
        szConnect: parseFloat(parts[2]) / 10000 || 0,
        total: parseFloat(parts[5]) / 10000 || 0,
        shBalance: parseFloat(parts[3]) / 10000 || 0,
        szBalance: parseFloat(parts[4]) / 10000 || 0,
      };
    } catch (error) {
      logger.error('Get northbound realtime error:', error);
      return null;
    }
  }

  // 获取北向资金历史数据
  async getHistoryFlow(days: number = 30): Promise<NorthboundFlow[]> {
    try {
      const url = `https://push2his.eastmoney.com/api/qt/kamt.kline/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55,f56&klt=101&lmt=${days}`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.s2n) return [];

      return data.data.s2n.map((item: string) => {
        const parts = item.split(',');
        return {
          date: parts[0],
          shConnect: parseFloat(parts[1]) / 10000 || 0,
          szConnect: parseFloat(parts[2]) / 10000 || 0,
          total: parseFloat(parts[5]) / 10000 || 0,
          shBalance: 0,
          szBalance: 0,
        };
      });
    } catch (error) {
      logger.error('Get northbound history error:', error);
      return [];
    }
  }

  // 获取北向持股排行
  async getTopHoldings(limit: number = 20): Promise<NorthboundHolding[]> {
    try {
      const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=ADD_MARKET_CAP&sortTypes=-1&pageSize=${limit}&pageNumber=1&reportName=RPT_MUTUAL_STOCK_NORTHSTA&columns=ALL`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.result?.data) return [];

      return data.result.data.map((item: any) => ({
        stockCode: item.SECURITY_CODE,
        stockName: item.SECURITY_NAME,
        holdShares: item.HOLD_SHARES || 0,
        holdMarketValue: (item.HOLD_MARKET_CAP || 0) / 100000000,
        holdRatio: item.FREECAP_RATIO || 0,
        changeShares: item.ADD_SHARES || 0,
        changeRatio: item.ADD_SHARES_RATIO || 0,
      }));
    } catch (error) {
      logger.error('Get northbound holdings error:', error);
      return [];
    }
  }

  // 计算北向资金趋势
  async analyzeTrend(): Promise<{ trend: string; description: string }> {
    const history = await this.getHistoryFlow(10);
    if (history.length < 5) {
      return { trend: 'unknown', description: '数据不足' };
    }

    const recent5 = history.slice(-5);
    const totalInflow = recent5.reduce((sum, d) => sum + d.total, 0);
    const avgInflow = totalInflow / 5;

    if (avgInflow > 50) {
      return { trend: 'strong_buy', description: `近5日日均净买入${avgInflow.toFixed(1)}亿，持续流入` };
    } else if (avgInflow > 0) {
      return { trend: 'buy', description: `近5日日均净买入${avgInflow.toFixed(1)}亿，温和流入` };
    } else if (avgInflow > -50) {
      return { trend: 'sell', description: `近5日日均净卖出${Math.abs(avgInflow).toFixed(1)}亿，温和流出` };
    } else {
      return { trend: 'strong_sell', description: `近5日日均净卖出${Math.abs(avgInflow).toFixed(1)}亿，持续流出` };
    }
  }
}

export const northboundService = new NorthboundService();
