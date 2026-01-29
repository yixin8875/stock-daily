import { chartDataService } from './chartData.service';
import { technicalIndicators } from './technicalIndicators.service';
import { logger } from './logger.service';

export interface StopLossAdvice {
  stockCode: string;
  currentPrice: number;
  atr: number;
  atrPercent: number;
  suggestions: StopLossSuggestion[];
}

export interface StopLossSuggestion {
  type: string;
  stopPrice: number;
  distance: number;
  distancePercent: number;
  description: string;
}

class StopLossAdvisorService {
  // 获取智能止损建议
  async getAdvice(stockCode: string, entryPrice: number): Promise<StopLossAdvice | null> {
    try {
      const klines = await chartDataService.getKLineData(stockCode, 'daily', 30);
      if (klines.length < 14) return null;

      const currentPrice = klines[klines.length - 1].close;
      const atrValues = technicalIndicators.atr(klines, 14);
      const atr = atrValues[atrValues.length - 1] || 0;
      const atrPercent = (atr / currentPrice) * 100;

      const suggestions = this.generateSuggestions(entryPrice, currentPrice, atr, klines);

      return {
        stockCode,
        currentPrice,
        atr: Math.round(atr * 100) / 100,
        atrPercent: Math.round(atrPercent * 100) / 100,
        suggestions,
      };
    } catch (error) {
      logger.error('Stop loss advice error:', error);
      return null;
    }
  }

  private generateSuggestions(
    entryPrice: number,
    currentPrice: number,
    atr: number,
    klines: any[]
  ): StopLossSuggestion[] {
    const suggestions: StopLossSuggestion[] = [];

    // 1. ATR止损 (2倍ATR)
    const atrStop = currentPrice - 2 * atr;
    suggestions.push(this.createSuggestion(
      'ATR动态止损',
      atrStop,
      entryPrice,
      '基于2倍ATR，适合趋势交易'
    ));

    // 2. 固定百分比止损 (5%)
    const percentStop = entryPrice * 0.95;
    suggestions.push(this.createSuggestion(
      '固定比例止损',
      percentStop,
      entryPrice,
      '固定5%止损，简单易执行'
    ));

    // 3. 支撑位止损
    const recentLows = klines.slice(-10).map(k => k.low);
    const supportLevel = Math.min(...recentLows);
    suggestions.push(this.createSuggestion(
      '支撑位止损',
      supportLevel * 0.98,
      entryPrice,
      '跌破近期支撑位2%时止损'
    ));

    // 4. 移动止损
    const closes = klines.map(k => k.close);
    const ma10 = technicalIndicators.sma(closes, 10);
    const trailingStop = ma10[ma10.length - 1] || currentPrice * 0.95;
    suggestions.push(this.createSuggestion(
      '移动均线止损',
      trailingStop,
      entryPrice,
      '跌破10日均线时止损'
    ));

    return suggestions.sort((a, b) => b.stopPrice - a.stopPrice);
  }

  private createSuggestion(
    type: string,
    stopPrice: number,
    entryPrice: number,
    description: string
  ): StopLossSuggestion {
    const distance = entryPrice - stopPrice;
    return {
      type,
      stopPrice: Math.round(stopPrice * 100) / 100,
      distance: Math.round(distance * 100) / 100,
      distancePercent: Math.round((distance / entryPrice) * 10000) / 100,
      description,
    };
  }
}

export const stopLossAdvisorService = new StopLossAdvisorService();
