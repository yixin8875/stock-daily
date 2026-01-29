import { PrismaClient, SignalType, SignalDirection } from '@prisma/client';
import { IndicatorService, KLineData } from './indicator.service';
import { signalService } from './signal.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface SignalConfig {
  macdEnabled: boolean;
  kdjEnabled: boolean;
  rsiEnabled: boolean;
  maEnabled: boolean;
  bollEnabled: boolean;
}

export interface GeneratedSignal {
  stockCode: string;
  stockName: string;
  signalType: SignalType;
  indicator: string;
  direction: SignalDirection;
  price: number;
  description: string;
}

const defaultConfig: SignalConfig = {
  macdEnabled: true,
  kdjEnabled: true,
  rsiEnabled: true,
  maEnabled: true,
  bollEnabled: true,
};

export class SignalGeneratorService {
  // 检测 MACD 信号
  static detectMACDSignal(
    klines: KLineData[],
    stockCode: string,
    stockName: string
  ): GeneratedSignal | null {
    if (klines.length < 30) return null;

    const current = IndicatorService.calcMACD(klines);
    const prev = IndicatorService.calcMACD(klines.slice(0, -1));
    const price = klines[klines.length - 1].close;

    // 金叉：DIF 上穿 DEA
    if (prev.dif <= prev.dea && current.dif > current.dea) {
      return {
        stockCode,
        stockName,
        signalType: 'MACD' as SignalType,
        indicator: `DIF:${current.dif} DEA:${current.dea}`,
        direction: 'BUY' as SignalDirection,
        price,
        description: `MACD金叉，DIF(${current.dif})上穿DEA(${current.dea})`,
      };
    }

    // 死叉：DIF 下穿 DEA
    if (prev.dif >= prev.dea && current.dif < current.dea) {
      return {
        stockCode,
        stockName,
        signalType: 'MACD' as SignalType,
        indicator: `DIF:${current.dif} DEA:${current.dea}`,
        direction: 'SELL' as SignalDirection,
        price,
        description: `MACD死叉，DIF(${current.dif})下穿DEA(${current.dea})`,
      };
    }

    return null;
  }

  // 检测 KDJ 信号
  static detectKDJSignal(
    klines: KLineData[],
    stockCode: string,
    stockName: string
  ): GeneratedSignal | null {
    if (klines.length < 15) return null;

    const current = IndicatorService.calcKDJ(klines);
    const prev = IndicatorService.calcKDJ(klines.slice(0, -1));
    const price = klines[klines.length - 1].close;

    // 超卖区金叉
    if (prev.k <= prev.d && current.k > current.d && current.k < 30) {
      return {
        stockCode,
        stockName,
        signalType: 'KDJ' as SignalType,
        indicator: `K:${current.k} D:${current.d} J:${current.j}`,
        direction: 'BUY' as SignalDirection,
        price,
        description: `KDJ超卖区金叉，K(${current.k})上穿D(${current.d})`,
      };
    }

    // 超买区死叉
    if (prev.k >= prev.d && current.k < current.d && current.k > 70) {
      return {
        stockCode,
        stockName,
        signalType: 'KDJ' as SignalType,
        indicator: `K:${current.k} D:${current.d} J:${current.j}`,
        direction: 'SELL' as SignalDirection,
        price,
        description: `KDJ超买区死叉，K(${current.k})下穿D(${current.d})`,
      };
    }

    return null;
  }

  // 检测 RSI 信号
  static detectRSISignal(
    klines: KLineData[],
    stockCode: string,
    stockName: string
  ): GeneratedSignal | null {
    if (klines.length < 30) return null;

    const current = IndicatorService.calcRSI(klines);
    const prev = IndicatorService.calcRSI(klines.slice(0, -1));
    const price = klines[klines.length - 1].close;

    // RSI 从超卖区回升
    if (prev.rsi6 < 20 && current.rsi6 >= 20) {
      return {
        stockCode,
        stockName,
        signalType: 'RSI' as SignalType,
        indicator: `RSI6:${current.rsi6} RSI12:${current.rsi12}`,
        direction: 'BUY' as SignalDirection,
        price,
        description: `RSI超卖回升，RSI6从${prev.rsi6}升至${current.rsi6}`,
      };
    }

    // RSI 从超买区回落
    if (prev.rsi6 > 80 && current.rsi6 <= 80) {
      return {
        stockCode,
        stockName,
        signalType: 'RSI' as SignalType,
        indicator: `RSI6:${current.rsi6} RSI12:${current.rsi12}`,
        direction: 'SELL' as SignalDirection,
        price,
        description: `RSI超买回落，RSI6从${prev.rsi6}降至${current.rsi6}`,
      };
    }

    return null;
  }

  // 检测均线信号
  static detectMASignal(
    klines: KLineData[],
    stockCode: string,
    stockName: string
  ): GeneratedSignal | null {
    if (klines.length < 65) return null;

    const current = IndicatorService.calcMA(klines);
    const prev = IndicatorService.calcMA(klines.slice(0, -1));
    const price = klines[klines.length - 1].close;
    const prevPrice = klines[klines.length - 2].close;

    // 价格上穿 MA20
    if (prevPrice <= prev.ma20 && price > current.ma20) {
      return {
        stockCode,
        stockName,
        signalType: 'MA' as SignalType,
        indicator: `MA5:${current.ma5} MA20:${current.ma20}`,
        direction: 'BUY' as SignalDirection,
        price,
        description: `价格上穿MA20，当前价${price}突破${current.ma20}`,
      };
    }

    // 价格下穿 MA20
    if (prevPrice >= prev.ma20 && price < current.ma20) {
      return {
        stockCode,
        stockName,
        signalType: 'MA' as SignalType,
        indicator: `MA5:${current.ma5} MA20:${current.ma20}`,
        direction: 'SELL' as SignalDirection,
        price,
        description: `价格下穿MA20，当前价${price}跌破${current.ma20}`,
      };
    }

    return null;
  }

  // 检测布林带信号
  static detectBOLLSignal(
    klines: KLineData[],
    stockCode: string,
    stockName: string
  ): GeneratedSignal | null {
    if (klines.length < 25) return null;

    const current = IndicatorService.calcBOLL(klines);
    const price = klines[klines.length - 1].close;
    const prevPrice = klines[klines.length - 2].close;

    // 价格触及下轨反弹
    if (prevPrice <= current.lower && price > current.lower) {
      return {
        stockCode,
        stockName,
        signalType: 'BOLL' as SignalType,
        indicator: `上轨:${current.upper} 中轨:${current.mid} 下轨:${current.lower}`,
        direction: 'BUY' as SignalDirection,
        price,
        description: `价格触及布林下轨反弹，下轨${current.lower}`,
      };
    }

    // 价格触及上轨回落
    if (prevPrice >= current.upper && price < current.upper) {
      return {
        stockCode,
        stockName,
        signalType: 'BOLL' as SignalType,
        indicator: `上轨:${current.upper} 中轨:${current.mid} 下轨:${current.lower}`,
        direction: 'SELL' as SignalDirection,
        price,
        description: `价格触及布林上轨回落，上轨${current.upper}`,
      };
    }

    return null;
  }

  // 生成所有信号
  static generateSignals(
    klines: KLineData[],
    stockCode: string,
    stockName: string,
    config: SignalConfig = defaultConfig
  ): GeneratedSignal[] {
    const signals: GeneratedSignal[] = [];

    if (config.macdEnabled) {
      const macdSignal = this.detectMACDSignal(klines, stockCode, stockName);
      if (macdSignal) signals.push(macdSignal);
    }

    if (config.kdjEnabled) {
      const kdjSignal = this.detectKDJSignal(klines, stockCode, stockName);
      if (kdjSignal) signals.push(kdjSignal);
    }

    if (config.rsiEnabled) {
      const rsiSignal = this.detectRSISignal(klines, stockCode, stockName);
      if (rsiSignal) signals.push(rsiSignal);
    }

    if (config.maEnabled) {
      const maSignal = this.detectMASignal(klines, stockCode, stockName);
      if (maSignal) signals.push(maSignal);
    }

    if (config.bollEnabled) {
      const bollSignal = this.detectBOLLSignal(klines, stockCode, stockName);
      if (bollSignal) signals.push(bollSignal);
    }

    return signals;
  }

  // 为用户自选股生成信号
  static async generateSignalsForWatchlist(
    userId: string,
    getKLineData: (code: string) => Promise<KLineData[]>
  ): Promise<GeneratedSignal[]> {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
    });

    const allSignals: GeneratedSignal[] = [];

    for (const stock of watchlist) {
      try {
        const klines = await getKLineData(stock.stockCode);
        const signals = this.generateSignals(
          klines,
          stock.stockCode,
          stock.stockName
        );
        allSignals.push(...signals);
      } catch (error) {
        logger.error(`Failed to generate signals for ${stock.stockCode}:`, error);
      }
    }

    return allSignals;
  }

  // 保存信号到数据库
  static async saveSignals(userId: string, signals: GeneratedSignal[]): Promise<void> {
    for (const signal of signals) {
      await signalService.createSignal(userId, signal);
    }
    logger.info(`Saved ${signals.length} signals for user ${userId}`);
  }
}

export const signalGeneratorService = new SignalGeneratorService();
