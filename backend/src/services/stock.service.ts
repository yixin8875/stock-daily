import axios from 'axios';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  time: string;
}

export interface StockSearchResult {
  code: string;
  name: string;
  market: string;
}

export class StockService {
  /**
   * 获取股票实时行情（使用新浪API）
   */
  static async getQuote(stockCode: string): Promise<StockQuote | null> {
    try {
      // 转换股票代码格式
      const sinaCode = this.toSinaCode(stockCode);
      const url = `https://hq.sinajs.cn/list=${sinaCode}`;

      const response = await axios.get(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
        responseType: 'arraybuffer',
      });

      const text = new TextDecoder('gbk').decode(response.data);
      return this.parseSinaQuote(stockCode, text);
    } catch (error) {
      console.error('Failed to fetch stock quote:', error);
      return null;
    }
  }

  /**
   * 批量获取股票行情
   */
  static async getQuotes(stockCodes: string[]): Promise<StockQuote[]> {
    try {
      const sinaCodes = stockCodes.map(code => this.toSinaCode(code));
      const url = `https://hq.sinajs.cn/list=${sinaCodes.join(',')}`;

      const response = await axios.get(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
        responseType: 'arraybuffer',
      });

      const text = new TextDecoder('gbk').decode(response.data);
      const lines = text.split('\n').filter(line => line.trim());

      const quotes: StockQuote[] = [];
      for (let i = 0; i < lines.length; i++) {
        const quote = this.parseSinaQuote(stockCodes[i], lines[i]);
        if (quote) {
          quotes.push(quote);
        }
      }
      return quotes;
    } catch (error) {
      console.error('Failed to fetch stock quotes:', error);
      return [];
    }
  }

  /**
   * 搜索股票
   */
  static async searchStock(keyword: string): Promise<StockSearchResult[]> {
    try {
      // 使用东方财富搜索API
      const url = `https://searchapi.eastmoney.com/api/suggest/get`;
      const response = await axios.get(url, {
        params: {
          input: keyword,
          type: 14,
          token: 'D43BF722C8E33BDC906FB84D85E326E8',
          count: 10,
        },
      });

      const data = response.data;
      if (data.QuotationCodeTable?.Data) {
        return data.QuotationCodeTable.Data.map((item: any) => ({
          code: item.Code,
          name: item.Name,
          market: item.MarketType === '1' ? 'SH' : 'SZ',
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to search stock:', error);
      return [];
    }
  }

  /**
   * 转换为新浪股票代码格式
   */
  private static toSinaCode(stockCode: string): string {
    const code = stockCode.replace(/\.(SH|SZ|sh|sz)$/, '');
    // 判断市场
    if (stockCode.toUpperCase().includes('SH') || code.startsWith('6')) {
      return `sh${code}`;
    } else if (stockCode.toUpperCase().includes('SZ') || code.startsWith('0') || code.startsWith('3')) {
      return `sz${code}`;
    }
    // 默认根据代码判断
    if (code.startsWith('6')) {
      return `sh${code}`;
    }
    return `sz${code}`;
  }

  /**
   * 解析新浪行情数据
   */
  private static parseSinaQuote(stockCode: string, text: string): StockQuote | null {
    try {
      const match = text.match(/="(.*)"/);
      if (!match || !match[1]) return null;

      const parts = match[1].split(',');
      if (parts.length < 32) return null;

      const name = parts[0];
      const open = parseFloat(parts[1]);
      const prevClose = parseFloat(parts[2]);
      const price = parseFloat(parts[3]);
      const high = parseFloat(parts[4]);
      const low = parseFloat(parts[5]);
      const volume = parseFloat(parts[8]);
      const amount = parseFloat(parts[9]);
      const date = parts[30];
      const time = parts[31];

      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      return {
        code: stockCode,
        name,
        price,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        open,
        high,
        low,
        volume,
        amount,
        time: `${date} ${time}`,
      };
    } catch (error) {
      return null;
    }
  }
}
