// 技术指标计算工具

export interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface MACDResult {
  dif: number;
  dea: number;
  macd: number;
}

export interface KDJResult {
  k: number;
  d: number;
  j: number;
}

export interface RSIResult {
  rsi6: number;
  rsi12: number;
  rsi24: number;
}

export interface MAResult {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
}

export class IndicatorService {
  // 计算 EMA
  private static ema(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  }

  // 计算 MA
  private static ma(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  // 计算 MACD
  static calcMACD(klines: KLineData[]): MACDResult {
    const closes = klines.map(k => k.close);
    if (closes.length < 26) {
      return { dif: 0, dea: 0, macd: 0 };
    }
    const ema12 = this.ema(closes, 12);
    const ema26 = this.ema(closes, 26);
    const dif = ema12.map((v, i) => v - ema26[i]);
    const dea = this.ema(dif, 9);
    const last = dif.length - 1;
    return {
      dif: Math.round(dif[last] * 100) / 100,
      dea: Math.round(dea[last] * 100) / 100,
      macd: Math.round((dif[last] - dea[last]) * 2 * 100) / 100,
    };
  }

  // 计算 KDJ
  static calcKDJ(klines: KLineData[], n: number = 9): KDJResult {
    if (klines.length < n) {
      return { k: 50, d: 50, j: 50 };
    }

    const rsv: number[] = [];
    for (let i = n - 1; i < klines.length; i++) {
      const slice = klines.slice(i - n + 1, i + 1);
      const low = Math.min(...slice.map(k => k.low));
      const high = Math.max(...slice.map(k => k.high));
      const close = klines[i].close;
      if (high === low) {
        rsv.push(50);
      } else {
        rsv.push(((close - low) / (high - low)) * 100);
      }
    }

    // 计算 K、D 值 (SMA 平滑)
    const kValues: number[] = [50];
    const dValues: number[] = [50];
    for (let i = 0; i < rsv.length; i++) {
      const newK = (2 / 3) * kValues[kValues.length - 1] + (1 / 3) * rsv[i];
      kValues.push(newK);
      const newD = (2 / 3) * dValues[dValues.length - 1] + (1 / 3) * newK;
      dValues.push(newD);
    }

    const lastK = kValues[kValues.length - 1];
    const lastD = dValues[dValues.length - 1];
    const lastJ = 3 * lastK - 2 * lastD;

    return {
      k: Math.round(lastK * 100) / 100,
      d: Math.round(lastD * 100) / 100,
      j: Math.round(lastJ * 100) / 100,
    };
  }

  // 计算 RSI
  static calcRSI(klines: KLineData[]): RSIResult {
    const closes = klines.map(k => k.close);

    const calcSingleRSI = (data: number[], period: number): number => {
      if (data.length < period + 1) return 50;

      const changes: number[] = [];
      for (let i = 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
      }

      const recentChanges = changes.slice(-period);
      let gains = 0;
      let losses = 0;

      for (const change of recentChanges) {
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }

      const avgGain = gains / period;
      const avgLoss = losses / period;

      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    return {
      rsi6: Math.round(calcSingleRSI(closes, 6) * 100) / 100,
      rsi12: Math.round(calcSingleRSI(closes, 12) * 100) / 100,
      rsi24: Math.round(calcSingleRSI(closes, 24) * 100) / 100,
    };
  }

  // 计算 MA (移动平均线)
  static calcMA(klines: KLineData[]): MAResult {
    const closes = klines.map(k => k.close);
    return {
      ma5: Math.round(this.ma(closes, 5) * 100) / 100,
      ma10: Math.round(this.ma(closes, 10) * 100) / 100,
      ma20: Math.round(this.ma(closes, 20) * 100) / 100,
      ma60: Math.round(this.ma(closes, 60) * 100) / 100,
    };
  }

  // 计算布林带
  static calcBOLL(klines: KLineData[], n: number = 20, k: number = 2): { upper: number; mid: number; lower: number } {
    const closes = klines.map(kl => kl.close);
    if (closes.length < n) {
      return { upper: 0, mid: 0, lower: 0 };
    }

    const slice = closes.slice(-n);
    const mid = slice.reduce((a, b) => a + b, 0) / n;

    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mid, 2), 0) / n;
    const std = Math.sqrt(variance);

    return {
      upper: Math.round((mid + k * std) * 100) / 100,
      mid: Math.round(mid * 100) / 100,
      lower: Math.round((mid - k * std) * 100) / 100,
    };
  }

  // 计算所有指标
  static calcAll(klines: KLineData[]) {
    return {
      macd: this.calcMACD(klines),
      kdj: this.calcKDJ(klines),
      rsi: this.calcRSI(klines),
      ma: this.calcMA(klines),
      boll: this.calcBOLL(klines),
    };
  }
}
