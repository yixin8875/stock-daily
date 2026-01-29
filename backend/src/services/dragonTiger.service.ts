import { cacheService } from './cache.service';
import { logger } from './logger.service';

export interface DragonTigerItem {
  stockCode: string;
  stockName: string;
  close: number;
  change: number;
  turnover: number;
  reason: string;
  buyTotal: number;
  sellTotal: number;
  netBuy: number;
}

export interface DragonTigerDetail {
  stockCode: string;
  stockName: string;
  buySeats: SeatInfo[];
  sellSeats: SeatInfo[];
}

export interface SeatInfo {
  rank: number;
  name: string;
  buyAmount: number;
  sellAmount: number;
  netAmount: number;
  type: string;
}

class DragonTigerService {
  // 获取龙虎榜列表
  async getList(date?: string): Promise<DragonTigerItem[]> {
    try {
      const targetDate = date || this.getLatestTradeDate();
      const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=SECURITY_CODE&sortTypes=1&pageSize=50&pageNumber=1&reportName=RPT_DAILYBILLBOARD_DETAILSNEW&columns=ALL&filter=(TRADE_DATE='${targetDate}')`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.result?.data) return [];

      const grouped = new Map<string, DragonTigerItem>();

      for (const item of data.result.data) {
        const code = item.SECURITY_CODE;
        if (!grouped.has(code)) {
          grouped.set(code, {
            stockCode: code,
            stockName: item.SECURITY_NAME,
            close: item.CLOSE_PRICE || 0,
            change: item.CHANGE_RATE || 0,
            turnover: (item.TURNOVERRATE || 0),
            reason: item.EXPLAIN || '',
            buyTotal: 0,
            sellTotal: 0,
            netBuy: 0,
          });
        }
        const stock = grouped.get(code)!;
        stock.buyTotal += item.BUY_TOTAL || 0;
        stock.sellTotal += item.SELL_TOTAL || 0;
        stock.netBuy = stock.buyTotal - stock.sellTotal;
      }

      return Array.from(grouped.values())
        .sort((a, b) => b.netBuy - a.netBuy);
    } catch (error) {
      logger.error('Get dragon tiger list error:', error);
      return [];
    }
  }

  // 获取单只股票龙虎榜详情
  async getDetail(stockCode: string, date?: string): Promise<DragonTigerDetail | null> {
    try {
      const targetDate = date || this.getLatestTradeDate();
      const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=RANK&sortTypes=1&pageSize=20&reportName=RPT_BILLBOARD_DAILYDETAILSBUY&columns=ALL&filter=(TRADE_DATE='${targetDate}')(SECURITY_CODE="${stockCode}")`;

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      const buySeats: SeatInfo[] = (data.result?.data || []).map((item: any) => ({
        rank: item.RANK,
        name: item.OPERATEDEPT_NAME || '',
        buyAmount: (item.BUY || 0) / 10000,
        sellAmount: (item.SELL || 0) / 10000,
        netAmount: ((item.BUY || 0) - (item.SELL || 0)) / 10000,
        type: this.getSeatType(item.OPERATEDEPT_NAME || ''),
      }));

      return {
        stockCode,
        stockName: data.result?.data?.[0]?.SECURITY_NAME || '',
        buySeats,
        sellSeats: [],
      };
    } catch (error) {
      logger.error('Get dragon tiger detail error:', error);
      return null;
    }
  }

  // 判断席位类型
  private getSeatType(name: string): string {
    if (name.includes('机构')) return 'institution';
    if (name.includes('沪股通') || name.includes('深股通')) return 'northbound';
    return 'broker';
  }

  // 获取最近交易日
  private getLatestTradeDate(): string {
    const now = new Date();
    const day = now.getDay();
    if (day === 0) now.setDate(now.getDate() - 2);
    else if (day === 6) now.setDate(now.getDate() - 1);
    return now.toISOString().split('T')[0];
  }

  // 获取机构净买入排行
  async getInstitutionBuy(limit: number = 10): Promise<DragonTigerItem[]> {
    const list = await this.getList();
    return list.filter(item => item.netBuy > 0).slice(0, limit);
  }
}

export const dragonTigerService = new DragonTigerService();
