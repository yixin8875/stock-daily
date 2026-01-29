import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface TradeReviewTemplate {
  id: string
  date: string
  stockCode: string
  stockName: string
  tradeType: 'buy' | 'sell'
  entryReason?: string
  exitReason?: string
  marketCondition?: string
  emotionState?: number
  lessonsLearned?: string
  improvement?: string
  rating: number
  createdAt: string
}

export interface TradeReviewTemplateInput {
  date: string
  stockCode: string
  stockName: string
  tradeType: 'buy' | 'sell'
  entryReason?: string
  exitReason?: string
  marketCondition?: string
  emotionState?: number
  lessonsLearned?: string
  improvement?: string
  rating: number
}

export const tradeReviewTemplateService = {
  getAll: () =>
    request.get<ApiResponse<TradeReviewTemplate[]>>('/trade-reviews'),
  create: (data: TradeReviewTemplateInput) =>
    request.post<ApiResponse<TradeReviewTemplate>>('/trade-reviews', data),
  update: (id: string, data: Partial<TradeReviewTemplateInput>) =>
    request.put<ApiResponse<TradeReviewTemplate>>(`/trade-reviews/${id}`, data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/trade-reviews/${id}`),
}
