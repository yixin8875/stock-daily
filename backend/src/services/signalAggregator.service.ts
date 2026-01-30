// 交易信号聚合服务
import axios from 'axios';

interface SignalSource {
  name: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
  reason: string;
}

interface AggregatedSignal {
  stockCode: string;
  stockName: string;
  overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  score: number; // -100 to 100
  sources: SignalSource[];
  suggestion: string;
}

class SignalAggregatorService {
  // 聚合多种信号
  async aggregateSignals(stockCode: string): Promise<AggregatedSignal> {
    const [maSignal, rsiSignal, macdSignal, volumeSignal, kdSignal] = await Promise.all([
      this.getMASignal(stockCode),
      this.getRSISignal(stockCode),
      this.getMACDSignal(stockCode),
      this.getVolumeSignal(stockCode),
      this.getKDSignal(stockCode),
    ]);

    const sources = [maSignal, rsiSignal, macdSignal, volumeSignal, kdSignal];
    const stockName = await this.getStockName(stockCode);

    // 计算综合得分
    let totalScore = 0;
    for (const s of sources) {
      const multiplier = s.signal === 'buy' ? 1 : s.signal === 'sell' ? -1 : 0;
      totalScore += multiplier * s.strength;
    }
    const score = Math.round(totalScore / sources.length);

    // 判断综合信号
    let overallSignal: AggregatedSignal['overallSignal'];
    let suggestion: string;

    if (score >= 60) {
      overallSignal = 'strong_buy';
      suggestion = '多项指标共振看多，可考虑积极买入';
    } else if (score >= 20) {
      overallSignal = 'buy';
      suggestion = '技术面偏多，可适量参与';
    } else if (score > -20) {
      overallSignal = 'neutral';
      suggestion = '信号分歧，建议观望';
    } else if (score > -60) {
      overallSignal = 'sell';
      suggestion = '技术面偏空，注意风险';
    } else {
      overallSignal = 'strong_sell';
      suggestion = '多项指标共振看空，建议回避';
    }

    return { stockCode, stockName, overallSignal, score, sources, suggestion };
  }

  private async getKlineData(stockCode: string): Promise<any[]> {
    const market = stockCode.startsWith('6') ? '1' : '0';
    const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${market}.${stockCode}&fields1=f1,f2,f3&fields2=f51,f52,f53,f54,f55,f56&klt=101&fqt=1&end=20500101&lmt=60`;
    const response = await axios.get(url);
    return response.data?.data?.klines || [];
  }

  private async getStockName(stockCode: string): Promise<string> {
    try {
      const market = stockCode.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${stockCode}&fields=f58`;
      const response = await axios.get(url);
      return response.data?.data?.f58 || stockCode;
    } catch {
      return stockCode;
    }
  }

  // 均线信号
  private async getMASignal(stockCode: string): Promise<SignalSource> {
    try {
      const klines = await this.getKlineData(stockCode);
      const closes = klines.map((k: string) => parseFloat(k.split(',')[2]));

      if (closes.length < 20) {
        return { name: '均线', signal: 'neutral', strength: 0, reason: '数据不足' };
      }

      const ma5 = this.calcMA(closes, 5);
      const ma10 = this.calcMA(closes, 10);
      const ma20 = this.calcMA(closes, 20);
      const price = closes[closes.length - 1];

      if (price > ma5 && ma5 > ma10 && ma10 > ma20) {
        return { name: '均线', signal: 'buy', strength: 80, reason: '多头排列' };
      } else if (price < ma5 && ma5 < ma10 && ma10 < ma20) {
        return { name: '均线', signal: 'sell', strength: 80, reason: '空头排列' };
      } else if (price > ma20) {
        return { name: '均线', signal: 'buy', strength: 40, reason: '站上20日线' };
      } else {
        return { name: '均线', signal: 'sell', strength: 40, reason: '跌破20日线' };
      }
    } catch {
      return { name: '均线', signal: 'neutral', strength: 0, reason: '获取失败' };
    }
  }

  // RSI信号
  private async getRSISignal(stockCode: string): Promise<SignalSource> {
    try {
      const klines = await this.getKlineData(stockCode);
      const closes = klines.map((k: string) => parseFloat(k.split(',')[2]));
      const rsi = this.calcRSI(closes, 14);

      if (rsi < 30) {
        return { name: 'RSI', signal: 'buy', strength: 70, reason: `RSI=${rsi.toFixed(0)}超卖` };
      } else if (rsi > 70) {
        return { name: 'RSI', signal: 'sell', strength: 70, reason: `RSI=${rsi.toFixed(0)}超买` };
      }
      return { name: 'RSI', signal: 'neutral', strength: 30, reason: `RSI=${rsi.toFixed(0)}中性` };
    } catch {
      return { name: 'RSI', signal: 'neutral', strength: 0, reason: '获取失败' };
    }
  }

  // MACD信号
  private async getMACDSignal(stockCode: string): Promise<SignalSource> {
    try {
      const klines = await this.getKlineData(stockCode);
      const closes = klines.map((k: string) => parseFloat(k.split(',')[2]));
      const { macd, signal, histogram } = this.calcMACD(closes);

      if (histogram > 0 && macd > signal) {
        return { name: 'MACD', signal: 'buy', strength: 60, reason: '金叉向上' };
      } else if (histogram < 0 && macd < signal) {
        return { name: 'MACD', signal: 'sell', strength: 60, reason: '死叉向下' };
      }
      return { name: 'MACD', signal: 'neutral', strength: 30, reason: '震荡' };
    } catch {
      return { name: 'MACD', signal: 'neutral', strength: 0, reason: '获取失败' };
    }
  }

  // 成交量信号
  private async getVolumeSignal(stockCode: string): Promise<SignalSource> {
    try {
      const klines = await this.getKlineData(stockCode);
      const volumes = klines.map((k: string) => parseFloat(k.split(',')[5]));
      const closes = klines.map((k: string) => parseFloat(k.split(',')[2]));

      const avgVol = volumes.slice(-20, -1).reduce((a, b) => a + b, 0) / 19;
      const lastVol = volumes[volumes.length - 1];
      const priceChange = (closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2];

      if (lastVol > avgVol * 1.5 && priceChange > 0) {
        return { name: '成交量', signal: 'buy', strength: 70, reason: '放量上涨' };
      } else if (lastVol > avgVol * 1.5 && priceChange < 0) {
        return { name: '成交量', signal: 'sell', strength: 70, reason: '放量下跌' };
      }
      return { name: '成交量', signal: 'neutral', strength: 20, reason: '量能平稳' };
    } catch {
      return { name: '成交量', signal: 'neutral', strength: 0, reason: '获取失败' };
    }
  }

  // KD信号
  private async getKDSignal(stockCode: string): Promise<SignalSource> {
    try {
      const klines = await this.getKlineData(stockCode);
      const { k, d } = this.calcKD(klines);

      if (k < 20 && d < 20) {
        return { name: 'KD', signal: 'buy', strength: 65, reason: 'KD超卖区' };
      } else if (k > 80 && d > 80) {
        return { name: 'KD', signal: 'sell', strength: 65, reason: 'KD超买区' };
      }
      return { name: 'KD', signal: 'neutral', strength: 25, reason: 'KD中性' };
    } catch {
      return { name: 'KD', signal: 'neutral', strength: 0, reason: '获取失败' };
    }
  }

  private calcMA(data: number[], period: number): number {
    return data.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calcRSI(closes: number[], period: number): number {
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }
    const gains = changes.slice(-period).filter(c => c > 0);
    const losses = changes.slice(-period).filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / period : 0;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calcMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calcEMA(closes, 12);
    const ema26 = this.calcEMA(closes, 26);
    const macd = ema12 - ema26;
    const signal = macd * 0.2 + (ema12 - ema26) * 0.8;
    return { macd, signal, histogram: macd - signal };
  }

  private calcEMA(data: number[], period: number): number {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calcKD(klines: any[]): { k: number; d: number } {
    const period = 9;
    const data = klines.slice(-period);
    const highs = data.map((k: string) => parseFloat(k.split(',')[3]));
    const lows = data.map((k: string) => parseFloat(k.split(',')[4]));
    const close = parseFloat(data[data.length - 1].split(',')[2]);

    const hh = Math.max(...highs);
    const ll = Math.min(...lows);
    const rsv = ((close - ll) / (hh - ll)) * 100;
    const k = rsv * 0.33 + 50 * 0.67;
    const d = k * 0.33 + 50 * 0.67;
    return { k, d };
  }
}

export const signalAggregatorService = new SignalAggregatorService();
