import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface ProfitPoint {
  date: string
  profit: number
  profitRate: number
  cumulativeProfit: number
  cumulativeProfitRate: number
}

export interface DrawdownInfo {
  maxDrawdown: number
  maxDrawdownRate: number
  drawdownStart: string
  drawdownEnd: string
}

export interface TradeReview {
  id: string
  stockCode: string
  stockName: string
  buyDate: string
  buyPrice: number
  buyQuantity: number
  buyReason: string | null
  sellDate: string | null
  sellPrice: number | null
  sellQuantity: number | null
  sellReason: string | null
  holdingDays: number
  profit: number | null
  profitRate: number | null
  status: 'open' | 'closed'
}

export interface PeriodReport {
  period: { start: string; end: string }
  summary: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfit: number
    avgProfit: number
    avgLoss: number
    maxProfit: number
    maxLoss: number
    profitFactor: number
  }
  dailyProfits: ProfitPoint[]
  topWinners: TradeReview[]
  topLosers: TradeReview[]
  stockStats: {
    stockCode: string
    stockName: string
    tradeCount: number
    profit: number
    winRate: number
  }[]
}

// AI Analysis types (placeholder for future implementation)
export interface TradingInsight {
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  suggestion?: string
}

export interface TradingPattern {
  pattern: string
  name: string
  frequency: number
  successRate: number
  winRate: number
  avgProfit: number
  description: string
}

export interface RiskAlert {
  level: 'high' | 'medium' | 'low'
  type: string
  title: string
  message: string
  description: string
  stocks?: string[]
  relatedStocks?: string[]
}

export interface AIAnalysisResult {
  insights: TradingInsight[]
  patterns: TradingPattern[]
  riskAlerts: RiskAlert[]
  suggestions: string[]
  summary: string
}

export const analysisService = {
  getProfitCurve: (startDate?: string, endDate?: string) => {
    return request.get<ApiResponse<{ curve: ProfitPoint[]; drawdown: DrawdownInfo }>>('/analysis/profit-curve', {
      params: { startDate, endDate },
    })
  },

  getTradeReviews: (startDate?: string, endDate?: string) => {
    return request.get<ApiResponse<TradeReview[]>>('/analysis/reviews', {
      params: { startDate, endDate },
    })
  },

  generateReport: (periodType: 'week' | 'month', date?: string) => {
    return request.get<ApiResponse<PeriodReport>>('/analysis/report', {
      params: { periodType, date },
    })
  },

  // AI Analysis (placeholder - returns mock data)
  getAnalysis: () => {
    return Promise.resolve({
      data: {
        data: {
          insights: [],
          patterns: [],
          riskAlerts: [],
          suggestions: [],
          summary: 'AI分析功能开发中...',
        } as AIAnalysisResult,
      },
    })
  },
}
