import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface Position {
  id: string
  stockCode: string
  stockName: string
  quantity: number
  costPrice: number
  totalCost: number
  targetPrice: number | null
  stopPrice: number | null
  notes: string | null
  currentPrice?: number
  marketValue?: number
  profit?: number
  profitRate?: number
}

export interface PositionInput {
  stockCode: string
  stockName: string
  quantity: number
  costPrice: number
  targetPrice?: number
  stopPrice?: number
  notes?: string
}

export const positionService = {
  getPositions: () => {
    return request.get<ApiResponse<Position[]>>('/positions')
  },

  getPositionSummary: () => {
    return request.get<ApiResponse<{
      stockCount: number
      totalCost: number
      positions: Position[]
    }>>('/positions/summary')
  },

  addPosition: (data: PositionInput) => {
    return request.post<ApiResponse<Position>>('/positions', data)
  },

  updatePosition: (id: string, data: Partial<PositionInput>) => {
    return request.put<ApiResponse<Position>>(`/positions/${id}`, data)
  },

  reducePosition: (id: string, quantity: number) => {
    return request.post<ApiResponse<Position | null>>(`/positions/${id}/reduce`, { quantity })
  },

  deletePosition: (id: string) => {
    return request.delete<ApiResponse<void>>(`/positions/${id}`)
  },
}
