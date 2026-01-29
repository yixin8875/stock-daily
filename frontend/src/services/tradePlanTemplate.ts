import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface TradePlanTemplate {
  id: string
  stockCode: string
  stockName: string
  direction: 'buy' | 'sell'
  entryPrice: number
  targetPrice: number
  stopPrice: number
  positionSize?: number
  reason?: string
  status: 'pending' | 'executed' | 'cancelled'
  createdAt: string
}

export interface TradePlanTemplateInput {
  stockCode: string
  stockName: string
  direction: 'buy' | 'sell'
  entryPrice: number
  targetPrice: number
  stopPrice: number
  positionSize?: number
  reason?: string
}

export const tradePlanTemplateService = {
  getAll: () =>
    request.get<ApiResponse<TradePlanTemplate[]>>('/trade-plans'),
  create: (data: TradePlanTemplateInput) =>
    request.post<ApiResponse<TradePlanTemplate>>('/trade-plans', data),
  update: (id: string, data: Partial<TradePlanTemplateInput & { status: string }>) =>
    request.put<ApiResponse<TradePlanTemplate>>(`/trade-plans/${id}`, data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/trade-plans/${id}`),
}
