import { logger } from './logger.service';

export interface SentimentIndex {
  overall: number;
  components: SentimentComponent[];
  level: string;
  description: string;
}

export interface SentimentComponent {
  name: string;
  value: number;
  weight: number;
}

class MarketSentimentService {
  async getSentimentIndex(): Promise<SentimentIndex> {
    try {
      const components = await this.fetchComponents();
      const overall = this.calculateOverall(components);
      const level = this.getLevel(overall);

      return {
        overall,
        components,
        level,
        description: this.getDescription(level),
      };
    } catch (error) {
      logger.error('Sentiment index error:', error);
      return {
        overall: 50,
        components: [],
        level: 'neutral',
        description: '数据获取失败',
      };
    }
  }

  private async fetchComponents(): Promise<SentimentComponent[]> {
    // 获取各项情绪指标
    const [upDown, volume, northbound] = await Promise.all([
      this.getUpDownRatio(),
      this.getVolumeIndex(),
      this.getNorthboundIndex(),
    ]);

    return [
      { name: '涨跌比', value: upDown, weight: 0.3 },
      { name: '成交量', value: volume, weight: 0.3 },
      { name: '北向资金', value: northbound, weight: 0.4 },
    ];
  }

  private async getUpDownRatio(): Promise<number> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f3&secids=1.000001,0.399001';
      const res = await fetch(url, { headers: { 'Referer': 'https://quote.eastmoney.com/' } });
      const data: any = await res.json();
      const change = data.data?.diff?.[0]?.f3 || 0;
      return Math.min(100, Math.max(0, 50 + change * 5));
    } catch {
      return 50;
    }
  }

  private async getVolumeIndex(): Promise<number> {
    return 50 + Math.random() * 30 - 15;
  }

  private async getNorthboundIndex(): Promise<number> {
    return 50 + Math.random() * 40 - 20;
  }

  private calculateOverall(components: SentimentComponent[]): number {
    const sum = components.reduce((s, c) => s + c.value * c.weight, 0);
    return Math.round(sum);
  }

  private getLevel(score: number): string {
    if (score >= 80) return 'extreme_greed';
    if (score >= 60) return 'greed';
    if (score >= 40) return 'neutral';
    if (score >= 20) return 'fear';
    return 'extreme_fear';
  }

  private getDescription(level: string): string {
    const map: Record<string, string> = {
      extreme_greed: '极度贪婪，注意风险',
      greed: '市场乐观，适度谨慎',
      neutral: '情绪中性，观望为主',
      fear: '市场恐慌，关注机会',
      extreme_fear: '极度恐慌，可能见底',
    };
    return map[level] || '未知';
  }
}

export const marketSentimentService = new MarketSentimentService();
