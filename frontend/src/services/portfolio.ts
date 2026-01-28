import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface IndustryDistribution {
  industry: string
  marketValue: number
  weight: number
  stockCount: number
  stocks: string[]
}

export interface RiskMetrics {
  totalValue: number
  totalCost: number
  totalProfit: number
  totalProfitRate: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  concentrationRisk: number
}

export interface PositionWarning {
  stockCode: string
  stockName: string
  warningType: 'OVERWEIGHT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'HIGH_LOSS'
  currentValue: number
  threshold: number
  message: string
}

export interface PortfolioAnalysis {
  distribution: IndustryDistribution[]
  metrics: RiskMetrics
  warnings: PositionWarning[]
}

// 相关性数据
export interface CorrelationData {
  stocks: string[]
  matrix: number[][]
}

// 行业配置建议
export interface IndustryAdvice {
  industry: string
  currentWeight: number
  suggestedWeight: number
  action: 'increase' | 'decrease' | 'hold'
  reason: string
}

// 再平衡建议
export interface RebalanceItem {
  stockCode: string
  stockName: string
  currentWeight: number
  targetWeight: number
  deviation: number
  action: 'buy' | 'sell' | 'hold'
  suggestedAmount: number
}

export const portfolioService = {
  getIndustryDistribution: (quotes: Record<string, number>) => {
    return request.post<ApiResponse<IndustryDistribution[]>>('/portfolio/industry', { quotes })
  },

  getRiskMetrics: (quotes: Record<string, number>) => {
    return request.post<ApiResponse<RiskMetrics>>('/portfolio/risk', { quotes })
  },

  getPositionWarnings: (quotes: Record<string, number>, thresholds?: { maxWeight?: number; stopLossPercent?: number }) => {
    return request.post<ApiResponse<PositionWarning[]>>('/portfolio/warnings', { quotes, thresholds })
  },

  getPortfolioAnalysis: (quotes: Record<string, number>) => {
    return request.post<ApiResponse<PortfolioAnalysis>>('/portfolio/analysis', { quotes })
  },

  // 获取相关性矩阵
  getCorrelation: () => {
    return request.get<ApiResponse<CorrelationData>>('/portfolio/correlation')
  },

  // 获取行业配置建议
  getIndustryAdvice: () => {
    return request.get<ApiResponse<IndustryAdvice[]>>('/portfolio/industry-advice')
  },

  // 获取再平衡建议
  getRebalanceAdvice: (targetWeights: Record<string, number>) => {
    return request.post<ApiResponse<RebalanceItem[]>>('/portfolio/rebalance', { targetWeights })
  },
}
