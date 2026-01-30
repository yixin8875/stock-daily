import { logger } from './logger.service';

export interface FlowNode {
  id: string;
  name: string;
  value: number;
}

export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

export interface FlowGraph {
  nodes: FlowNode[];
  links: FlowLink[];
}

class MoneyFlowGraphService {
  async getFlowGraph(): Promise<FlowGraph> {
    try {
      const sectors = await this.fetchSectorFlows();
      return this.buildGraph(sectors);
    } catch (error) {
      logger.error('Flow graph error:', error);
      return { nodes: [], links: [] };
    }
  }

  private async fetchSectorFlows(): Promise<any[]> {
    const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&fs=m:90+t:2&fields=f12,f14,f62';
    const res = await fetch(url, {
      headers: { 'Referer': 'https://data.eastmoney.com/' }
    });
    const data: any = await res.json();
    return data.data?.diff || [];
  }

  private buildGraph(sectors: any[]): FlowGraph {
    const nodes: FlowNode[] = [{ id: 'market', name: '市场', value: 0 }];
    const links: FlowLink[] = [];

    for (const s of sectors) {
      const flow = (s.f62 || 0) / 100000000;
      nodes.push({ id: s.f12, name: s.f14, value: Math.abs(flow) });

      if (flow > 0) {
        links.push({ source: 'market', target: s.f12, value: flow });
      } else {
        links.push({ source: s.f12, target: 'market', value: Math.abs(flow) });
      }
    }

    return { nodes, links };
  }
}

export const moneyFlowGraphService = new MoneyFlowGraphService();
