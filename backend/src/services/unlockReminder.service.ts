import { logger } from './logger.service';

export interface UnlockInfo {
  stockCode: string;
  stockName: string;
  unlockDate: string;
  unlockShares: number;
  unlockRatio: number;
  unlockType: string;
  marketValue: number;
}

class UnlockReminderService {
  async getUpcomingUnlocks(days: number = 30): Promise<UnlockInfo[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      const startDate = new Date();

      const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=FREE_DATE&sortTypes=1&pageSize=50&pageNumber=1&reportName=RPT_LIFT_STAGE&columns=ALL&filter=(FREE_DATE>='${startDate.toISOString().split('T')[0]}')(FREE_DATE<='${endDate.toISOString().split('T')[0]}')`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.result?.data) return [];

      return data.result.data.map((item: any) => ({
        stockCode: item.SECURITY_CODE,
        stockName: item.SECURITY_NAME_ABBR,
        unlockDate: item.FREE_DATE?.split(' ')[0] || '',
        unlockShares: item.FREE_SHARES || 0,
        unlockRatio: item.FREE_RATIO || 0,
        unlockType: item.LIMITED_TYPE || '',
        marketValue: (item.FREE_MARKET_CAP || 0) / 100000000,
      }));
    } catch (error) {
      logger.error('Get unlock info error:', error);
      return [];
    }
  }
}

export const unlockReminderService = new UnlockReminderService();
