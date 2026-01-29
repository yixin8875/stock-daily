import { wsService } from './websocket.service';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

interface QuoteData {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  high: number;
  low: number;
  open: number;
  preClose: number;
  timestamp: number;
}

class RealtimeQuoteService {
  private subscriptions: Map<string, Set<string>> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.pollingInterval = setInterval(() => this.fetchAndBroadcast(), 3000);
    logger.info('Realtime quote service started');
  }

  stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    logger.info('Realtime quote service stopped');
  }

  subscribe(userId: string, stockCodes: string[]): void {
    stockCodes.forEach(code => {
      if (!this.subscriptions.has(code)) {
        this.subscriptions.set(code, new Set());
      }
      this.subscriptions.get(code)!.add(userId);
    });
  }

  unsubscribe(userId: string, stockCodes?: string[]): void {
    if (stockCodes) {
      stockCodes.forEach(code => {
        this.subscriptions.get(code)?.delete(userId);
      });
    } else {
      this.subscriptions.forEach(users => users.delete(userId));
    }
  }

  private async fetchAndBroadcast(): Promise<void> {
    const codes = Array.from(this.subscriptions.keys());
    if (codes.length === 0) return;

    try {
      const quotes = await this.fetchQuotes(codes);
      quotes.forEach(quote => {
        wsService.broadcast(`quote:${quote.code}`, quote);
        cacheService.set(`quote:${quote.code}`, quote, 60);
      });
    } catch (error) {
      logger.error('Fetch quotes error:', error);
    }
  }

  private async fetchQuotes(codes: string[]): Promise<QuoteData[]> {
    const secIds = codes.map(code => {
      if (code.startsWith('6')) return `1.${code}`;
      return `0.${code}`;
    }).join(',');

    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?secids=${secIds}&fields=f12,f14,f2,f3,f4,f5,f6,f15,f16,f17,f18`;

    const response = await fetch(url, {
      headers: { 'Referer': 'https://quote.eastmoney.com/' }
    });
    const data: any = await response.json();

    if (!data.data?.diff) return [];

    return data.data.diff.map((item: any) => ({
      code: item.f12,
      name: item.f14,
      price: item.f2 / 100,
      change: item.f4 / 100,
      changePercent: item.f3 / 100,
      volume: item.f5,
      amount: item.f6,
      high: item.f15 / 100,
      low: item.f16 / 100,
      open: item.f17 / 100,
      preClose: item.f18 / 100,
      timestamp: Date.now(),
    }));
  }

  async getLatestQuote(code: string): Promise<QuoteData | null> {
    const cached = await cacheService.get<QuoteData>(`quote:${code}`);
    if (cached) return cached;

    const quotes = await this.fetchQuotes([code]);
    return quotes[0] || null;
  }
}

export const realtimeQuoteService = new RealtimeQuoteService();
