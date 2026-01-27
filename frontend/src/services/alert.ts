import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export type AlertType = 'TAKE_PROFIT' | 'STOP_LOSS' | 'PRICE_ABOVE' | 'PRICE_BELOW'

export interface PriceAlert {
  id: string
  positionId: string | null
  stockCode: string
  stockName: string
  alertType: AlertType
  targetPrice: number
  isTriggered: boolean
  isEnabled: boolean
  notes: string | null
  triggeredAt: string | null
  createdAt: string
}

export interface AlertInput {
  positionId?: string
  stockCode: string
  stockName: string
  alertType: AlertType
  targetPrice: number
  notes?: string
}

export const alertService = {
  getAlerts: (includeTriggered = false) => {
    return request.get<ApiResponse<PriceAlert[]>>('/alerts', {
      params: { includeTriggered },
    })
  },

  createAlert: (data: AlertInput) => {
    return request.post<ApiResponse<PriceAlert>>('/alerts', data)
  },

  updateAlert: (id: string, data: Partial<AlertInput & { isEnabled: boolean }>) => {
    return request.put<ApiResponse<PriceAlert>>(`/alerts/${id}`, data)
  },

  deleteAlert: (id: string) => {
    return request.delete<ApiResponse<void>>(`/alerts/${id}`)
  },

  checkAlerts: (quotes: { code: string; price: number }[]) => {
    return request.post<ApiResponse<PriceAlert[]>>('/alerts/check', { quotes })
  },

  resetAlert: (id: string) => {
    return request.post<ApiResponse<PriceAlert>>(`/alerts/${id}/reset`)
  },
}
