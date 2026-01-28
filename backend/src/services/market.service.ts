import axios from 'axios';

// 龙虎榜数据接口
export interface DragonTigerItem {
  code: string;
  name: string;
  change: number;
  reason: string;
  buyAmount: number;
  sellAmount: number;
  netAmount: number;
}

// 机构交易数据接口
export interface InstitutionTrade {
  code: string;
  name: string;
  direction: 'buy' | 'sell';
  amount: number;
  seats: number;
}

// 北向资金流入数据接口
export interface NorthFlowData {
  date: string;
  shConnect: number;
  szConnect: number;
  total: number;
}

// 北向资金买入股票接口
export interface NorthTopStock {
  rank: number;
  code: string;
  name: string;
  netBuy: number;
  change: number;
}

// 板块数据接口
export interface SectorData {
  code: string;
  name: string;
  change: number;
  changePercent: number;
  leadingStock: string;
  leadingStockChange: number;
  volume: number;
  amount: number;
}

// 板块轮动数据接口
export interface SectorRotation {
  date: string;
  sectors: SectorData[];
}

export class MarketService {
  /**
   * 获取龙虎榜数据（东方财富）
   */
  static async getDragonTiger(date?: string): Promise<DragonTigerItem[]> {
    try {
      const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
      const response = await axios.get(url, {
        params: {
          sortColumns: 'NET_BUY_AMT',
          sortTypes: -1,
          pageSize: 50,
          pageNumber: 1,
          reportName: 'RPT_DAILYBILLBOARD_DETAILSNEW',
          columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,TRADE_DATE,CHANGE_RATE,CLOSE_PRICE,BILLBOARD_NET_AMT,BILLBOARD_BUY_AMT,BILLBOARD_SELL_AMT,EXPLANATION',
          source: 'WEB',
          client: 'WEB',
        },
      });

      const data = response.data;
      if (data.result?.data) {
        return data.result.data.map((item: any) => ({
          code: item.SECURITY_CODE,
          name: item.SECURITY_NAME_ABBR,
          change: item.CHANGE_RATE || 0,
          reason: item.EXPLANATION || '',
          buyAmount: (item.BILLBOARD_BUY_AMT || 0) / 100000000,
          sellAmount: (item.BILLBOARD_SELL_AMT || 0) / 100000000,
          netAmount: (item.BILLBOARD_NET_AMT || 0) / 100000000,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch dragon tiger data:', error);
      return [];
    }
  }

  /**
   * 获取机构交易数据
   */
  static async getInstitutionTrades(date?: string): Promise<InstitutionTrade[]> {
    try {
      const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
      const response = await axios.get(url, {
        params: {
          sortColumns: 'NET_BUY_AMT',
          sortTypes: -1,
          pageSize: 30,
          pageNumber: 1,
          reportName: 'RPT_ORGANIZATION_TRADE_DETAILS',
          columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,TRADE_DATE,BUY_AMT,SELL_AMT,NET_BUY_AMT,TRADE_DIRECTION,OPERATEDEPT_COUNT',
          source: 'WEB',
          client: 'WEB',
        },
      });

      const data = response.data;
      if (data.result?.data) {
        return data.result.data.map((item: any) => ({
          code: item.SECURITY_CODE,
          name: item.SECURITY_NAME_ABBR,
          direction: (item.NET_BUY_AMT || 0) > 0 ? 'buy' : 'sell',
          amount: Math.abs((item.NET_BUY_AMT || 0) / 100000000),
          seats: item.OPERATEDEPT_COUNT || 1,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch institution trades:', error);
      return [];
    }
  }

  /**
   * 获取北向资金流入数据
   */
  static async getNorthFlow(days: number = 10): Promise<NorthFlowData[]> {
    try {
      const url = 'https://push2his.eastmoney.com/api/qt/kamt.kline/get';
      const response = await axios.get(url, {
        params: {
          fields1: 'f1,f3',
          fields2: 'f51,f52,f53,f54,f55,f56',
          klt: 101,
          lmt: days,
        },
      });

      const data = response.data;
      if (data.data?.s2n) {
        return data.data.s2n.map((line: string) => {
          const parts = line.split(',');
          const shConnect = parseFloat(parts[1]) / 10000 || 0;
          const szConnect = parseFloat(parts[2]) / 10000 || 0;
          return {
            date: parts[0],
            shConnect: Math.round(shConnect * 100) / 100,
            szConnect: Math.round(szConnect * 100) / 100,
            total: Math.round((shConnect + szConnect) * 100) / 100,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch north flow:', error);
      return [];
    }
  }

  /**
   * 获取北向资金买入TOP股票
   */
  static async getNorthTopStocks(limit: number = 10): Promise<NorthTopStock[]> {
    try {
      const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
      const response = await axios.get(url, {
        params: {
          sortColumns: 'ADD_MARKET_CAP',
          sortTypes: -1,
          pageSize: limit,
          pageNumber: 1,
          reportName: 'RPT_MUTUAL_STOCK_NORTHSTA',
          columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,ADD_MARKET_CAP,CHANGE_RATE',
          source: 'WEB',
          client: 'WEB',
        },
      });

      const data = response.data;
      if (data.result?.data) {
        return data.result.data.map((item: any, idx: number) => ({
          rank: idx + 1,
          code: item.SECURITY_CODE,
          name: item.SECURITY_NAME_ABBR,
          netBuy: (item.ADD_MARKET_CAP || 0) / 100000000,
          change: item.CHANGE_RATE || 0,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch north top stocks:', error);
      return [];
    }
  }

  /**
   * 获取板块列表
   */
  static async getSectors(): Promise<SectorData[]> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/clist/get';
      const response = await axios.get(url, {
        params: {
          pn: 1,
          pz: 50,
          fs: 'm:90+t:2',
          fields: 'f12,f14,f3,f8,f104,f105,f128,f136',
        },
      });

      const data = response.data;
      if (data.data?.diff) {
        return data.data.diff.map((item: any) => ({
          code: item.f12,
          name: item.f14,
          change: item.f3 / 100 || 0,
          changePercent: item.f3 / 100 || 0,
          leadingStock: item.f128 || '',
          leadingStockChange: item.f136 / 100 || 0,
          volume: item.f104 || 0,
          amount: item.f105 || 0,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
      return [];
    }
  }

  /**
   * 获取板块轮动数据
   */
  static async getSectorRotation(days: number = 5): Promise<SectorRotation[]> {
    try {
      const sectors = await this.getSectors();
      const today = new Date().toISOString().split('T')[0];
      return [{
        date: today,
        sectors: sectors.slice(0, 20),
      }];
    } catch (error) {
      console.error('Failed to fetch sector rotation:', error);
      return [];
    }
  }
}
