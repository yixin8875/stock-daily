import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export type SignalType = 'MA_CROSS' | 'MACD_CROSS' | 'KDJ_SIGNAL' | 'RSI_SIGNAL' | 'VOLUME_BREAK' | 'PRICE_BREAK' | 'CUSTOM'
export type SignalDirection = 'BUY' | 'SELL'

export interface TradeSignal {
  id: string
  stockCode: string
  stockName: string
  signalType: SignalType
  indicator: string
  direction: SignalDirection
  price: number
  description: string | null
  isRead: boolean
  triggeredAt: string
  createdAt: string
}

export interface SignalInput {
  stockCode: string
  stockName: string
  signalType: SignalType
  indicator: string
  direction: SignalDirection
  price: number
  description?: string
}

export const signalService = {
  getSignals: (unreadOnly = false) => {
    return request.get<ApiResponse<TradeSignal[]>>('/signals', {
      params: { unreadOnly },
    })
  },

  createSignal: (data: SignalInput) => {
    return request.post<ApiResponse<TradeSignal>>('/signals', data)
  },

  markAsRead: (id: string) => {
    return request.post<ApiResponse<TradeSignal>>(`/signals/${id}/read`)
  },

  markAllAsRead: () => {
    return request.post<ApiResponse<void>>('/signals/read-all')
  },

  deleteSignal: (id: string) => {
    return request.delete<ApiResponse<void>>(`/signals/${id}`)
  },
}
