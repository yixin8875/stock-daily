import { logger } from './logger.service';

export interface KLineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class TechnicalIndicators {
  // 简单移动平均线
  sma(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  // 指数移动平均线
  ema(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        result.push(data[0]);
      } else {
        result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
      }
    }
    return result;
  }

  // MACD
  macd(data: number[], fast = 12, slow = 26, signal = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const emaFast = this.ema(data, fast);
    const emaSlow = this.ema(data, slow);
    const macdLine = emaFast.map((v, i) => v - emaSlow[i]);
    const signalLine = this.ema(macdLine, signal);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    return { macd: macdLine, signal: signalLine, histogram };
  }

  // RSI
  rsi(data: number[], period = 14): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        result.push(NaN);
      } else {
        const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      }
    }
    return result;
  }

  // 布林带
  bollingerBands(data: number[], period = 20, stdDev = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.sma(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = middle[i];
        const variance = slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / period;
        const std = Math.sqrt(variance);
        upper.push(mean + stdDev * std);
        lower.push(mean - stdDev * std);
      }
    }

    return { upper, middle, lower };
  }

  // KDJ 指标
  kdj(klines: KLineData[], period = 9): { k: number[]; d: number[]; j: number[] } {
    const k: number[] = [];
    const d: number[] = [];
    const j: number[] = [];

    for (let i = 0; i < klines.length; i++) {
      if (i < period - 1) {
        k.push(50);
        d.push(50);
        j.push(50);
      } else {
        const slice = klines.slice(i - period + 1, i + 1);
        const high = Math.max(...slice.map(k => k.high));
        const low = Math.min(...slice.map(k => k.low));
        const rsv = high === low ? 50 : ((klines[i].close - low) / (high - low)) * 100;

        const prevK = k[i - 1] || 50;
        const prevD = d[i - 1] || 50;
        const curK = (2 / 3) * prevK + (1 / 3) * rsv;
        const curD = (2 / 3) * prevD + (1 / 3) * curK;
        const curJ = 3 * curK - 2 * curD;

        k.push(curK);
        d.push(curD);
        j.push(curJ);
      }
    }
    return { k, d, j };
  }

  // ATR (平均真实波幅)
  atr(klines: KLineData[], period = 14): number[] {
    const tr: number[] = [];
    for (let i = 0; i < klines.length; i++) {
      if (i === 0) {
        tr.push(klines[i].high - klines[i].low);
      } else {
        const hl = klines[i].high - klines[i].low;
        const hc = Math.abs(klines[i].high - klines[i - 1].close);
        const lc = Math.abs(klines[i].low - klines[i - 1].close);
        tr.push(Math.max(hl, hc, lc));
      }
    }
    return this.sma(tr, period);
  }

  // OBV (能量潮)
  obv(klines: KLineData[]): number[] {
    const result: number[] = [0];
    for (let i = 1; i < klines.length; i++) {
      const prev = result[i - 1];
      if (klines[i].close > klines[i - 1].close) {
        result.push(prev + klines[i].volume);
      } else if (klines[i].close < klines[i - 1].close) {
        result.push(prev - klines[i].volume);
      } else {
        result.push(prev);
      }
    }
    return result;
  }

  // CCI (顺势指标)
  cci(klines: KLineData[], period = 20): number[] {
    const result: number[] = [];
    const tp = klines.map(k => (k.high + k.low + k.close) / 3);

    for (let i = 0; i < klines.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const slice = tp.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const md = slice.reduce((sum, v) => sum + Math.abs(v - mean), 0) / period;
        result.push(md === 0 ? 0 : (tp[i] - mean) / (0.015 * md));
      }
    }
    return result;
  }

  // WR (威廉指标)
  williamsR(klines: KLineData[], period = 14): number[] {
    const result: number[] = [];
    for (let i = 0; i < klines.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const slice = klines.slice(i - period + 1, i + 1);
        const high = Math.max(...slice.map(k => k.high));
        const low = Math.min(...slice.map(k => k.low));
        const wr = high === low ? 0 : ((high - klines[i].close) / (high - low)) * -100;
        result.push(wr);
      }
    }
    return result;
  }

  // DMI (趋向指标)
  dmi(klines: KLineData[], period = 14): { pdi: number[]; mdi: number[]; adx: number[] } {
    const pdi: number[] = [];
    const mdi: number[] = [];
    const adx: number[] = [];
    const pdm: number[] = [];
    const mdm: number[] = [];
    const tr: number[] = [];

    for (let i = 0; i < klines.length; i++) {
      if (i === 0) {
        pdm.push(0);
        mdm.push(0);
        tr.push(klines[i].high - klines[i].low);
      } else {
        const upMove = klines[i].high - klines[i - 1].high;
        const downMove = klines[i - 1].low - klines[i].low;
        pdm.push(upMove > downMove && upMove > 0 ? upMove : 0);
        mdm.push(downMove > upMove && downMove > 0 ? downMove : 0);
        tr.push(Math.max(
          klines[i].high - klines[i].low,
          Math.abs(klines[i].high - klines[i - 1].close),
          Math.abs(klines[i].low - klines[i - 1].close)
        ));
      }
    }

    const atr = this.ema(tr, period);
    const smoothPdm = this.ema(pdm, period);
    const smoothMdm = this.ema(mdm, period);

    for (let i = 0; i < klines.length; i++) {
      const curPdi = atr[i] === 0 ? 0 : (smoothPdm[i] / atr[i]) * 100;
      const curMdi = atr[i] === 0 ? 0 : (smoothMdm[i] / atr[i]) * 100;
      pdi.push(curPdi);
      mdi.push(curMdi);
    }

    const dx: number[] = [];
    for (let i = 0; i < klines.length; i++) {
      const sum = pdi[i] + mdi[i];
      dx.push(sum === 0 ? 0 : (Math.abs(pdi[i] - mdi[i]) / sum) * 100);
    }

    const adxLine = this.ema(dx, period);
    adx.push(...adxLine);

    return { pdi, mdi, adx };
  }
}

export const technicalIndicators = new TechnicalIndicators();
