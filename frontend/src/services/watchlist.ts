import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface WatchlistStock {
  id: string
  stockCode: string
  stockName: string
  industry: string | null
  addPrice: number | null
  targetPrice: number | null
  stopPrice: number | null
  notes: string | null
  sortOrder: number
  createdAt: string
}

export interface WatchlistInput {
  stockCode: string
  stockName: string
  industry?: string
  addPrice?: number
  targetPrice?: number
  stopPrice?: number
  notes?: string
}

export const watchlistService = {
  getWatchlist: () => {
    return request.get<ApiResponse<WatchlistStock[]>>('/watchlist')
  },

  addStock: (data: WatchlistInput) => {
    return request.post<ApiResponse<WatchlistStock>>('/watchlist', data)
  },

  updateStock: (id: string, data: Partial<WatchlistInput>) => {
    return request.put<ApiResponse<WatchlistStock>>(`/watchlist/${id}`, data)
  },

  removeStock: (id: string) => {
    return request.delete<ApiResponse<void>>(`/watchlist/${id}`)
  },

  reorderStocks: (stockIds: string[]) => {
    return request.post<ApiResponse<void>>('/watchlist/reorder', { stockIds })
  },
}
