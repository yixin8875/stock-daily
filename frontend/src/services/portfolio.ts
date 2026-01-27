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
}
