import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { MarketService, SectorData, MarketSentiment } from './market.service';

const prisma = new PrismaClient();

export interface AIAnalysisConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface StockCandidate {
  code: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  turnover: number;
  signals: string[];
  score: number;
  reason: string;
}

export interface MarketAnalysisReport {
  date: string;
  marketOverview: {
    sentiment: MarketSentiment | null;
    trend: string;
    summary: string;
  };
  hotSectors: {
    sectors: SectorData[];
    analysis: string;
  };
  stockCandidates: StockCandidate[];
  aiSummary: string;
  riskWarnings: string[];
  tradingSuggestions: string[];
}

interface StockKline {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

class AIAnalysisService {
  private config: AIAnalysisConfig = {};

  setConfig(config: AIAnalysisConfig) {
    this.config = config;
  }

  // 获取股票K线数据
  private async getStockKlines(code: string, days = 60): Promise<StockKline[]> {
    try {
      const market = code.startsWith('6') ? '1' : '0';
      const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
      const resp = await axios.get(url, {
        params: {
          secid: `${market}.${code}`,
          fields1: 'f1',
          fields2: 'f51,f52,f53,f54,f55,f56',
          klt: 101,
          fqt: 1,
          end: '20500101',
          lmt: days,
        },
      });
      if (resp.data?.data?.klines) {
        return resp.data.data.klines.map((k: string) => {
          const p = k.split(',');
          return {
            date: p[0],
            open: parseFloat(p[1]),
            close: parseFloat(p[2]),
            high: parseFloat(p[3]),
            low: parseFloat(p[4]),
            volume: parseFloat(p[5]),
          };
        });
      }
    } catch (e) {
      console.error('获取K线失败:', e);
    }
    return [];
  }

  // 计算MA均线
  private calcMA(klines: StockKline[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < klines.length; i++) {
      if (i < period - 1) {
        result.push(0);
      } else {
        const sum = klines.slice(i - period + 1, i + 1).reduce((a, k) => a + k.close, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  // 计算成交量MA
  private calcVolumeMA(klines: StockKline[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < klines.length; i++) {
      if (i < period - 1) {
        result.push(0);
      } else {
        const sum = klines.slice(i - period + 1, i + 1).reduce((a, k) => a + k.volume, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  // 分析技术形态
  private analyzePattern(klines: StockKline[]): { signals: string[]; score: number } {
    if (klines.length < 20) return { signals: [], score: 0 };

    const signals: string[] = [];
    let score = 50;
    const last = klines[klines.length - 1];
    const ma5 = this.calcMA(klines, 5);
    const ma10 = this.calcMA(klines, 10);
    const ma20 = this.calcMA(klines, 20);
    const volMA5 = this.calcVolumeMA(klines, 5);

    const lastIdx = klines.length - 1;

    // 均线多头排列
    if (ma5[lastIdx] > ma10[lastIdx] && ma10[lastIdx] > ma20[lastIdx]) {
      signals.push('均线多头');
      score += 15;
    }

    // 金叉信号
    if (ma5[lastIdx] > ma10[lastIdx] && ma5[lastIdx - 1] <= ma10[lastIdx - 1]) {
      signals.push('MA金叉');
      score += 10;
    }

    // 放量上涨
    if (last.volume > volMA5[lastIdx] * 1.5 && last.close > last.open) {
      signals.push('放量上涨');
      score += 10;
    }

    // 突破前高
    const recentHigh = Math.max(...klines.slice(-20, -1).map(k => k.high));
    if (last.close > recentHigh) {
      signals.push('突破前高');
      score += 15;
    }

    return { signals, score: Math.min(100, score) };
  }

  // 获取热门板块的领涨股
  private async getSectorLeadingStocks(sectors: SectorData[]): Promise<StockCandidate[]> {
    const candidates: StockCandidate[] = [];
    const topSectors = sectors.slice(0, 5);

    for (const sector of topSectors) {
      try {
        const url = 'https://push2.eastmoney.com/api/qt/clist/get';
        const resp = await axios.get(url, {
          params: {
            pn: 1, pz: 5,
            fs: `b:${sector.code}`,
            fields: 'f12,f14,f2,f3,f5,f6,f8',
            fid: 'f3', po: 1,
          },
        });

        if (resp.data?.data?.diff) {
          for (const s of resp.data.data.diff.slice(0, 3)) {
            const code = s.f12;
            const klines = await this.getStockKlines(code);
            const { signals, score } = this.analyzePattern(klines);

            if (score >= 60) {
              candidates.push({
                code,
                name: s.f14,
                sector: sector.name,
                price: s.f2 / 100,
                change: s.f3 / 100,
                volume: s.f5,
                turnover: s.f8,
                signals,
                score,
                reason: `${sector.name}板块领涨股`,
              });
            }
          }
        }
      } catch (e) {
        console.error('获取板块股票失败:', e);
      }
    }

    return candidates.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // 生成市场趋势描述
  private getTrendDescription(sentiment: MarketSentiment | null): string {
    if (!sentiment) return '数据获取中';
    const { advanceCount, declineCount, sentimentLevel } = sentiment;
    const ratio = advanceCount / (declineCount || 1);

    if (sentimentLevel === 'extreme_greed') return '市场极度乐观，注意风险';
    if (sentimentLevel === 'greed') return '市场情绪偏多，可适度参与';
    if (sentimentLevel === 'extreme_fear') return '市场极度恐慌，可关注超跌机会';
    if (sentimentLevel === 'fear') return '市场情绪偏空，谨慎操作';
    return ratio > 1 ? '市场震荡偏强' : '市场震荡偏弱';
  }

  // 调用AI生成分析总结
  private async callAI(prompt: string): Promise<string> {
    if (!this.config.apiKey || !this.config.baseUrl) {
      return '请配置AI API密钥';
    }

    try {
      const resp = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        },
        { headers: { Authorization: `Bearer ${this.config.apiKey}` } }
      );
      return resp.data.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.error('AI调用失败:', e);
      return '分析生成失败';
    }
  }

  // 生成完整分析报告
  async generateReport(): Promise<MarketAnalysisReport> {
    const today = new Date().toISOString().split('T')[0];

    // 获取市场数据
    const [sentiment, sectors] = await Promise.all([
      MarketService.getMarketSentiment(),
      MarketService.getSectors(),
    ]);

    const hotSectors = sectors.slice(0, 10);
    const trend = this.getTrendDescription(sentiment);

    // 获取候选股票
    const candidates = await this.getSectorLeadingStocks(hotSectors);

    // 生成风险提示
    const warnings: string[] = [];
    if (sentiment?.limitUpCount && sentiment.limitUpCount > 50) {
      warnings.push('涨停股数量过多，市场可能过热');
    }
    if (sentiment?.limitDownCount && sentiment.limitDownCount > 30) {
      warnings.push('跌停股数量较多，注意系统性风险');
    }

    // 生成交易建议
    const suggestions: string[] = [];
    if (sentiment?.sentimentLevel === 'extreme_greed') {
      suggestions.push('市场情绪过热，建议减仓观望');
    } else if (sentiment?.sentimentLevel === 'extreme_fear') {
      suggestions.push('市场恐慌，可分批建仓优质标的');
    } else {
      suggestions.push('保持仓位，关注热门板块轮动');
    }

    return {
      date: today,
      marketOverview: {
        sentiment,
        trend,
        summary: `今日${sentiment?.advanceCount || 0}涨${sentiment?.declineCount || 0}跌`,
      },
      hotSectors: {
        sectors: hotSectors,
        analysis: `领涨板块：${hotSectors.slice(0, 3).map(s => s.name).join('、')}`,
      },
      stockCandidates: candidates,
      aiSummary: '',
      riskWarnings: warnings,
      tradingSuggestions: suggestions,
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();
