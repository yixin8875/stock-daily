import { logger } from './logger.service';

export interface BlackSwanAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium';
  stockCode?: string;
  description: string;
  timestamp: Date;
}

class BlackSwanService {
  async scanAlerts(): Promise<BlackSwanAlert[]> {
    const alerts: BlackSwanAlert[] = [];

    try {
      const [marketAlert, stockAlerts] = await Promise.all([
        this.checkMarketAnomaly(),
        this.checkStockAnomalies(),
      ]);

      if (marketAlert) alerts.push(marketAlert);
      alerts.push(...stockAlerts);

      return alerts.sort((a, b) =>
        this.severityScore(b.severity) - this.severityScore(a.severity)
      );
    } catch (error) {
      logger.error('Black swan scan error:', error);
      return [];
    }
  }

  private severityScore(s: string): number {
    return s === 'critical' ? 3 : s === 'high' ? 2 : 1;
  }

  private async checkMarketAnomaly(): Promise<BlackSwanAlert | null> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f3&secids=1.000001';
      const res = await fetch(url, {
        headers: { 'Referer': 'https://quote.eastmoney.com/' }
      });
      const data: any = await res.json();
      const change = data.data?.diff?.[0]?.f3 || 0;

      if (change < -5) {
        return {
          type: 'market_crash',
          severity: 'critical',
          description: `大盘暴跌${Math.abs(change).toFixed(2)}%`,
          timestamp: new Date(),
        };
      }
      if (change < -3) {
        return {
          type: 'market_drop',
          severity: 'high',
          description: `大盘大跌${Math.abs(change).toFixed(2)}%`,
          timestamp: new Date(),
        };
      }
    } catch {}
    return null;
  }

  private async checkStockAnomalies(): Promise<BlackSwanAlert[]> {
    // 简化实现，实际应检查持仓股票
    return [];
  }
}

export const blackSwanService = new BlackSwanService();
