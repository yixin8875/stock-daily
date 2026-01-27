import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface TradingInsight {
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  suggestion?: string
}

export interface TradingPattern {
  pattern: string
  frequency: number
  avgProfit: number
  winRate: number
}

export interface RiskAlert {
  level: 'high' | 'medium' | 'low'
  type: string
  message: string
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
  // 获取AI分析结果
  getAnalysis: () => {
    return request.get<ApiResponse<AIAnalysisResult>>('/analysis')
  },
}
