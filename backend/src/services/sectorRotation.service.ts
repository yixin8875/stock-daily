import { cacheService } from './cache.service';
import { logger } from './logger.service';

export interface SectorFlow {
  sectorCode: string;
  sectorName: string;
  change: number;
  mainNetInflow: number;
  superNetInflow: number;
  bigNetInflow: number;
  midNetInflow: number;
  smallNetInflow: number;
  leadingStock: string;
  leadingChange: number;
}

export interface RotationSignal {
  fromSector: string;
  toSector: string;
  strength: number;
  description: string;
}

class SectorRotationService {
  // 获取行业资金流向
  async getSectorFlow(): Promise<SectorFlow[]> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&fs=m:90+t:2&fields=f2,f3,f12,f14,f62,f66,f69,f72,f75,f78,f184,f204,f205';

      const response = await fetch(url, {
        headers: { 'Referer': 'https://data.eastmoney.com/' }
      });
      const data: any = await response.json();

      if (!data.data?.diff) return [];

      return data.data.diff.map((item: any) => ({
        sectorCode: item.f12,
        sectorName: item.f14,
        change: item.f3 || 0,
        mainNetInflow: (item.f62 || 0) / 100000000,
        superNetInflow: (item.f66 || 0) / 100000000,
        bigNetInflow: (item.f72 || 0) / 100000000,
        midNetInflow: (item.f78 || 0) / 100000000,
        smallNetInflow: (item.f84 || 0) / 100000000,
        leadingStock: item.f204 || '',
        leadingChange: item.f205 || 0,
      }));
    } catch (error) {
      logger.error('Get sector flow error:', error);
      return [];
    }
  }

  // 分析行业轮动信号
  async analyzeRotation(): Promise<RotationSignal[]> {
    const flows = await this.getSectorFlow();
    if (flows.length < 5) return [];

    const signals: RotationSignal[] = [];
    const sorted = [...flows].sort((a, b) => b.mainNetInflow - a.mainNetInflow);

    const topInflow = sorted.slice(0, 3);
    const topOutflow = sorted.slice(-3).reverse();

    for (const outSector of topOutflow) {
      for (const inSector of topInflow) {
        if (outSector.mainNetInflow < -1 && inSector.mainNetInflow > 1) {
          signals.push({
            fromSector: outSector.sectorName,
            toSector: inSector.sectorName,
            strength: Math.min(100, Math.abs(outSector.mainNetInflow) + inSector.mainNetInflow),
            description: `资金从${outSector.sectorName}流出${Math.abs(outSector.mainNetInflow).toFixed(1)}亿，流入${inSector.sectorName} ${inSector.mainNetInflow.toFixed(1)}亿`,
          });
        }
      }
    }

    return signals.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  // 获取热门行业排行
  async getHotSectors(limit: number = 10): Promise<SectorFlow[]> {
    const flows = await this.getSectorFlow();
    return flows
      .filter(f => f.mainNetInflow > 0)
      .sort((a, b) => b.mainNetInflow - a.mainNetInflow)
      .slice(0, limit);
  }

  // 获取资金流出行业
  async getColdSectors(limit: number = 10): Promise<SectorFlow[]> {
    const flows = await this.getSectorFlow();
    return flows
      .filter(f => f.mainNetInflow < 0)
      .sort((a, b) => a.mainNetInflow - b.mainNetInflow)
      .slice(0, limit);
  }
}

export const sectorRotationService = new SectorRotationService();
