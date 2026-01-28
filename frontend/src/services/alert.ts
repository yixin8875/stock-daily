import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export type AlertType = 'TAKE_PROFIT' | 'STOP_LOSS' | 'PRICE_ABOVE' | 'PRICE_BELOW' | 'BREAKOUT' | 'VOLATILITY' | 'MACD' | 'KDJ' | 'VOLUME' | 'MA'

// 技术指标提醒类型
export type TechnicalAlertType = 'MACD_GOLDEN' | 'MACD_DEATH' | 'KDJ_OVERBOUGHT' | 'KDJ_OVERSOLD' | 'VOLUME_SURGE' | 'VOLUME_SHRINK' | 'MA_BREAK_UP' | 'MA_BREAK_DOWN'

// 技术指标提醒
export interface TechnicalAlert {
  id: string
  stockCode: string
  stockName: string
  alertType: TechnicalAlertType
  maType?: 'MA5' | 'MA10' | 'MA20' | 'MA60'
  volumeThreshold?: number
  isEnabled: boolean
  isTriggered: boolean
  triggeredAt: string | null
  triggeredValue?: number
  notes: string | null
  createdAt: string
}

export interface TechnicalAlertInput {
  stockCode: string
  stockName: string
  alertType: TechnicalAlertType
  maType?: 'MA5' | 'MA10' | 'MA20' | 'MA60'
  volumeThreshold?: number
  notes?: string
}

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

// 智能止盈止损建议
export interface StopLossAdvice {
  stockCode: string
  stockName: string
  currentPrice: number
  volatility: number
  atr: number
  suggestedStopLoss: number
  suggestedTakeProfit: number
  stopLossPercent: number
  takeProfitPercent: number
  riskRewardRatio: number
}

// 仓位建议
export interface PositionAdvice {
  stockCode: string
  stockName: string
  currentPrice: number
  winRate: number
  avgWin: number
  avgLoss: number
  kellyPercent: number
  halfKellyPercent: number
  suggestedShares: number
  suggestedAmount: number
  maxLossAmount: number
}

// 复盘提醒设置
export interface ReviewReminder {
  id: string
  isEnabled: boolean
  reminderTime: string
  reminderDays: number[]
  lastRemindedAt: string | null
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

  // 获取智能止盈止损建议
  getStopLossAdvice: (stockCode: string, entryPrice: number) => {
    return request.get<ApiResponse<StopLossAdvice>>('/alerts/stop-loss-advice', {
      params: { stockCode, entryPrice },
    })
  },

  // 获取仓位建议
  getPositionAdvice: (stockCode: string, totalCapital: number, stopLossPrice: number) => {
    return request.get<ApiResponse<PositionAdvice>>('/alerts/position-advice', {
      params: { stockCode, totalCapital, stopLossPrice },
    })
  },

  // 获取技术指标提醒列表
  getTechnicalAlerts: (includeTriggered = false) => {
    return request.get<ApiResponse<TechnicalAlert[]>>('/alerts/technical', {
      params: { includeTriggered },
    })
  },

  // 创建技术指标提醒
  createTechnicalAlert: (data: TechnicalAlertInput) => {
    return request.post<ApiResponse<TechnicalAlert>>('/alerts/technical', data)
  },

  // 更新技术指标提醒
  updateTechnicalAlert: (id: string, data: Partial<TechnicalAlertInput & { isEnabled: boolean }>) => {
    return request.put<ApiResponse<TechnicalAlert>>(`/alerts/technical/${id}`, data)
  },

  // 删除技术指标提醒
  deleteTechnicalAlert: (id: string) => {
    return request.delete<ApiResponse<void>>(`/alerts/technical/${id}`)
  },

  // 重置技术指标提醒
  resetTechnicalAlert: (id: string) => {
    return request.post<ApiResponse<TechnicalAlert>>(`/alerts/technical/${id}/reset`)
  },
}
