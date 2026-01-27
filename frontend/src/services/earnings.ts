import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface EarningsEvent {
  id: string
  stockCode: string
  stockName: string
  reportDate: string
  reportType: string
  isNotified: boolean
  notes: string | null
  createdAt: string
}

export interface EarningsInput {
  stockCode: string
  stockName: string
  reportDate: string
  reportType: string
  notes?: string
}

export const earningsService = {
  getEarnings: (startDate?: string, endDate?: string) => {
    return request.get<ApiResponse<EarningsEvent[]>>('/earnings', {
      params: { startDate, endDate },
    })
  },

  getUpcoming: (days = 30) => {
    return request.get<ApiResponse<EarningsEvent[]>>('/earnings/upcoming', {
      params: { days },
    })
  },

  addEarnings: (data: EarningsInput) => {
    return request.post<ApiResponse<EarningsEvent>>('/earnings', data)
  },

  updateEarnings: (id: string, data: Partial<EarningsInput>) => {
    return request.put<ApiResponse<EarningsEvent>>(`/earnings/${id}`, data)
  },

  deleteEarnings: (id: string) => {
    return request.delete<ApiResponse<void>>(`/earnings/${id}`)
  },
}
