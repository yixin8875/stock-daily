import { chartDataService } from './chartData.service';
import { technicalIndicators } from './technicalIndicators.service';
import { logger } from './logger.service';

export interface TimingSignal {
  stockCode: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasons: string[];
  indicators: IndicatorStatus[];
}

export interface IndicatorStatus {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
}

class SmartTimingService {
  async analyzeTimng(stockCode: string): Promise<TimingSignal | null> {
    try {
      const klines = await chartDataService.getKLineData(stockCode, 'daily', 60);
      if (klines.length < 30) return null;

      const closes = klines.map(k => k.close);
      const indicators = this.analyzeIndicators(klines, closes);
      const { action, confidence, reasons } = this.determineAction(indicators);

      return { stockCode, action, confidence, reasons, indicators };
    } catch (error) {
      logger.error('Timing analysis error:', error);
      return null;
    }
  }

  private analyzeIndicators(klines: any[], closes: number[]): IndicatorStatus[] {
    const indicators: IndicatorStatus[] = [];

    // MA分析
    const ma5 = technicalIndicators.sma(closes, 5);
    const ma20 = technicalIndicators.sma(closes, 20);
    const maSignal = ma5[ma5.length - 1] > ma20[ma20.length - 1] ? 'bullish' : 'bearish';
    indicators.push({ name: 'MA', value: ma5[ma5.length - 1], signal: maSignal });

    // RSI分析
    const rsi = technicalIndicators.rsi(closes, 14);
    const rsiVal = rsi[rsi.length - 1];
    const rsiSignal = rsiVal > 70 ? 'bearish' : rsiVal < 30 ? 'bullish' : 'neutral';
    indicators.push({ name: 'RSI', value: Math.round(rsiVal), signal: rsiSignal });

    // MACD分析
    const macd = technicalIndicators.macd(closes);
    const macdSignal = macd.histogram[macd.histogram.length - 1] > 0 ? 'bullish' : 'bearish';
    indicators.push({ name: 'MACD', value: macd.histogram[macd.histogram.length - 1], signal: macdSignal });

    return indicators;
  }

  private determineAction(indicators: IndicatorStatus[]) {
    const bullish = indicators.filter(i => i.signal === 'bullish').length;
    const bearish = indicators.filter(i => i.signal === 'bearish').length;
    const reasons: string[] = [];

    indicators.forEach(i => {
      if (i.signal === 'bullish') reasons.push(`${i.name}看多`);
      if (i.signal === 'bearish') reasons.push(`${i.name}看空`);
    });

    if (bullish >= 2) return { action: 'buy' as const, confidence: 60 + bullish * 10, reasons };
    if (bearish >= 2) return { action: 'sell' as const, confidence: 60 + bearish * 10, reasons };
    return { action: 'hold' as const, confidence: 50, reasons };
  }
}

export const smartTimingService = new SmartTimingService();
