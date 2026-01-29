import { PrismaClient } from '@prisma/client';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface EventSignal {
  stockCode: string;
  stockName: string;
  eventType: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  timestamp: Date;
}

export interface EventConfig {
  type: string;
  enabled: boolean;
  params: Record<string, any>;
}

class EventDrivenService {
  private defaultConfigs: EventConfig[] = [
    { type: 'earnings_surprise', enabled: true, params: { threshold: 0.1 } },
    { type: 'dividend_announce', enabled: true, params: { yieldMin: 0.03 } },
    { type: 'large_volume', enabled: true, params: { multiplier: 3 } },
    { type: 'price_breakout', enabled: true, params: { days: 20 } },
  ];

  // 扫描事件信号
  async scanSignals(stockCodes: string[]): Promise<EventSignal[]> {
    const signals: EventSignal[] = [];

    for (const code of stockCodes) {
      try {
        const stockSignals = await this.analyzeStock(code);
        signals.push(...stockSignals);
      } catch (error) {
        logger.error(`Event scan error for ${code}:`, error);
      }
    }

    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  // 分析单只股票
  private async analyzeStock(stockCode: string): Promise<EventSignal[]> {
    const signals: EventSignal[] = [];
    const stockData = await this.fetchStockData(stockCode);

    if (!stockData) return signals;

    // 检查放量突破
    const volumeSignal = this.checkVolumeBreakout(stockData);
    if (volumeSignal) signals.push(volumeSignal);

    // 检查价格突破
    const priceSignal = this.checkPriceBreakout(stockData);
    if (priceSignal) signals.push(priceSignal);

    return signals;
  }

  // 获取股票数据
  private async fetchStockData(stockCode: string): Promise<any> {
    const market = stockCode.startsWith('6') ? '1' : '0';
    const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${market}.${stockCode}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=1&end=20500101&lmt=30`;

    try {
      const response = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.klines) return null;

      return {
        code: stockCode,
        name: data.data.name,
        klines: data.data.klines.map((k: string) => {
          const parts = k.split(',');
          return {
            date: parts[0],
            open: parseFloat(parts[1]),
            close: parseFloat(parts[2]),
            high: parseFloat(parts[3]),
            low: parseFloat(parts[4]),
            volume: parseFloat(parts[5]),
          };
        }),
      };
    } catch {
      return null;
    }
  }

  // 检查放量突破
  private checkVolumeBreakout(data: any): EventSignal | null {
    const klines = data.klines;
    if (klines.length < 10) return null;

    const recent = klines[klines.length - 1];
    const avgVolume = klines.slice(-10, -1).reduce((s: number, k: any) => s + k.volume, 0) / 9;

    if (recent.volume > avgVolume * 2 && recent.close > recent.open) {
      return {
        stockCode: data.code,
        stockName: data.name,
        eventType: 'large_volume',
        signal: 'buy',
        confidence: Math.min(90, 50 + (recent.volume / avgVolume - 2) * 20),
        reason: `成交量放大${(recent.volume / avgVolume).toFixed(1)}倍，价格上涨`,
        timestamp: new Date(),
      };
    }

    return null;
  }

  // 检查价格突破
  private checkPriceBreakout(data: any): EventSignal | null {
    const klines = data.klines;
    if (klines.length < 20) return null;

    const recent = klines[klines.length - 1];
    const high20 = Math.max(...klines.slice(-20, -1).map((k: any) => k.high));

    if (recent.close > high20) {
      return {
        stockCode: data.code,
        stockName: data.name,
        eventType: 'price_breakout',
        signal: 'buy',
        confidence: 70,
        reason: `突破20日新高 ${high20.toFixed(2)}`,
        timestamp: new Date(),
      };
    }

    const low20 = Math.min(...klines.slice(-20, -1).map((k: any) => k.low));
    if (recent.close < low20) {
      return {
        stockCode: data.code,
        stockName: data.name,
        eventType: 'price_breakdown',
        signal: 'sell',
        confidence: 70,
        reason: `跌破20日新低 ${low20.toFixed(2)}`,
        timestamp: new Date(),
      };
    }

    return null;
  }
}

export const eventDrivenService = new EventDrivenService();
