import { IndicatorService, KLineData } from './indicator.service';

export interface TradeSignal {
  type: 'buy' | 'sell';
  strength: 'strong' | 'medium' | 'weak';
  indicator: string;
  reason: string;
  price: number;
  timestamp: Date;
}

export class SignalAnalyzer {
  static analyzeMACD(klines: KLineData[]): TradeSignal | null {
    if (klines.length < 30) return null;
    const macd = IndicatorService.calcMACD(klines);
    const prevMacd = IndicatorService.calcMACD(klines.slice(0, -1));
    const price = klines[klines.length - 1].close;

    if (prevMacd.dif <= prevMacd.dea && macd.dif > macd.dea) {
      return {
        type: 'buy',
        strength: macd.dif < 0 ? 'strong' : 'medium',
        indicator: 'MACD',
        reason: 'MACD金叉',
        price,
        timestamp: new Date(),
      };
    }
    if (prevMacd.dif >= prevMacd.dea && macd.dif < macd.dea) {
      return {
        type: 'sell',
        strength: macd.dif > 0 ? 'strong' : 'medium',
        indicator: 'MACD',
        reason: 'MACD死叉',
        price,
        timestamp: new Date(),
      };
    }
    return null;
  }

  static analyzeKDJ(klines: KLineData[]): TradeSignal | null {
    if (klines.length < 15) return null;
    const kdj = IndicatorService.calcKDJ(klines);
    const price = klines[klines.length - 1].close;

    if (kdj.j < 20 && kdj.k < 30) {
      return {
        type: 'buy',
        strength: kdj.j < 10 ? 'strong' : 'medium',
        indicator: 'KDJ',
        reason: 'KDJ超卖',
        price,
        timestamp: new Date(),
      };
    }
    if (kdj.j > 80 && kdj.k > 70) {
      return {
        type: 'sell',
        strength: kdj.j > 90 ? 'strong' : 'medium',
        indicator: 'KDJ',
        reason: 'KDJ超买',
        price,
        timestamp: new Date(),
      };
    }
    return null;
  }

  static analyzeRSI(klines: KLineData[]): TradeSignal | null {
    if (klines.length < 30) return null;
    const rsi = IndicatorService.calcRSI(klines);
    const price = klines[klines.length - 1].close;

    if (rsi.rsi6 < 20) {
      return { type: 'buy', strength: 'strong', indicator: 'RSI', reason: 'RSI超卖', price, timestamp: new Date() };
    }
    if (rsi.rsi6 > 80) {
      return { type: 'sell', strength: 'strong', indicator: 'RSI', reason: 'RSI超买', price, timestamp: new Date() };
    }
    return null;
  }

  static analyzeAll(klines: KLineData[]): TradeSignal[] {
    const signals: TradeSignal[] = [];
    const macdSignal = this.analyzeMACD(klines);
    const kdjSignal = this.analyzeKDJ(klines);
    const rsiSignal = this.analyzeRSI(klines);

    if (macdSignal) signals.push(macdSignal);
    if (kdjSignal) signals.push(kdjSignal);
    if (rsiSignal) signals.push(rsiSignal);

    return signals;
  }
}
