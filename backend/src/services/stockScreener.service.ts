import { cacheService } from './cache.service';
import { logger } from './logger.service';

export interface ScreenerCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
}

export interface ScreenerResult {
  code: string;
  name: string;
  price: number;
  change: number;
  pe: number;
  pb: number;
  marketCap: number;
  turnover: number;
  volume: number;
}

class StockScreenerService {
  private readonly baseUrl = 'https://push2.eastmoney.com/api/qt/clist/get';

  async screen(conditions: ScreenerCondition[], limit = 50): Promise<ScreenerResult[]> {
    const filter = this.buildFilter(conditions);
    const cacheKey = `screener:${JSON.stringify(conditions)}:${limit}`;

    const cached = await cacheService.get<ScreenerResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const results = await this.fetchStocks(filter, limit);
      await cacheService.set(cacheKey, results, 300);
      return results;
    } catch (error) {
      logger.error('Stock screener error:', error);
      return [];
    }
  }

  private buildFilter(conditions: ScreenerCondition[]): string {
    const filters: string[] = [];
    const fieldMap: Record<string, string> = {
      pe: 'f9',
      pb: 'f23',
      marketCap: 'f20',
      turnover: 'f8',
      change: 'f3',
      price: 'f2',
    };

    for (const cond of conditions) {
      const field = fieldMap[cond.field];
      if (!field) continue;

      if (cond.operator === 'between' && Array.isArray(cond.value)) {
        filters.push(`(${field}>=${cond.value[0]})(${field}<=${cond.value[1]})`);
      } else if (typeof cond.value === 'number') {
        const opMap: Record<string, string> = { gt: '>', lt: '<', eq: '=', gte: '>=', lte: '<=' };
        const op = opMap[cond.operator];
        if (op) filters.push(`(${field}${op}${cond.value})`);
      }
    }
    return filters.join('');
  }

  private async fetchStocks(filter: string, limit: number): Promise<ScreenerResult[]> {
    const url = `${this.baseUrl}?pn=1&pz=${limit}&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f5,f6,f8,f9,f12,f14,f20,f23`;

    const response = await fetch(url, {
      headers: { 'Referer': 'https://quote.eastmoney.com/' }
    });
    const data: any = await response.json();

    if (!data.data?.diff || !Array.isArray(data.data.diff)) return [];

    return data.data.diff.map((item: any) => ({
      code: item.f12,
      name: item.f14,
      price: item.f2 / 100,
      change: item.f3 / 100,
      pe: item.f9,
      pb: item.f23,
      marketCap: item.f20,
      turnover: item.f8 / 100,
      volume: item.f5,
    }));
  }

  // 预设策略：低估值
  async screenLowValuation(limit = 30): Promise<ScreenerResult[]> {
    return this.screen([
      { field: 'pe', operator: 'between', value: [0, 20] },
      { field: 'pb', operator: 'lt', value: 2 },
    ], limit);
  }

  // 预设策略：高换手
  async screenHighTurnover(limit = 30): Promise<ScreenerResult[]> {
    return this.screen([
      { field: 'turnover', operator: 'gt', value: 5 },
    ], limit);
  }

  // 预设策略：涨幅榜
  async screenTopGainers(limit = 30): Promise<ScreenerResult[]> {
    return this.screen([
      { field: 'change', operator: 'gt', value: 3 },
    ], limit);
  }
}

export const stockScreenerService = new StockScreenerService();
