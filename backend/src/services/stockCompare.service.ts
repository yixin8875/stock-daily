// 股票对比分析服务
import axios from 'axios';

interface StockCompareItem {
  stockCode: string;
  stockName: string;
  price: number;
  change: number;
  pe: number;
  pb: number;
  marketCap: number;
  turnoverRate: number;
}

interface CompareResult {
  stocks: StockCompareItem[];
  metrics: { name: string; values: number[]; best: number }[];
}

class StockCompareService {
  async compareStocks(stockCodes: string[]): Promise<CompareResult> {
    const stocks: StockCompareItem[] = [];

    for (const code of stockCodes) {
      const data = await this.getStockData(code);
      if (data) stocks.push(data);
    }

    const metrics = this.calculateMetrics(stocks);
    return { stocks, metrics };
  }

  private async getStockData(stockCode: string): Promise<StockCompareItem | null> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${stockCode}&fields=f43,f44,f45,f46,f47,f48,f50,f57,f58,f116,f117,f162,f168,f170`;
      const res = await axios.get(url);
      const d = res.data?.data;
      if (!d) return null;

      return {
        stockCode,
        stockName: d.f58 || stockCode,
        price: (d.f43 || 0) / 100,
        change: (d.f170 || 0) / 100,
        pe: (d.f162 || 0) / 100,
        pb: (d.f167 || 0) / 100,
        marketCap: (d.f116 || 0) / 100000000,
        turnoverRate: (d.f168 || 0) / 100,
      };
    } catch {
      return null;
    }
  }

  private calculateMetrics(stocks: StockCompareItem[]) {
    if (stocks.length === 0) return [];

    const metrics = [
      { name: '市盈率', key: 'pe', lower: true },
      { name: '市净率', key: 'pb', lower: true },
      { name: '市值(亿)', key: 'marketCap', lower: false },
      { name: '换手率', key: 'turnoverRate', lower: false },
    ];

    return metrics.map(m => {
      const values = stocks.map(s => (s as any)[m.key] || 0);
      const validValues = values.filter(v => v > 0);
      const best = m.lower
        ? Math.min(...validValues)
        : Math.max(...validValues);
      return { name: m.name, values, best };
    });
  }
}

export const stockCompareService = new StockCompareService();
