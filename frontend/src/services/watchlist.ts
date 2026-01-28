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
  groupId?: string
}

// 自选股分组
export interface WatchlistGroup {
  id: string
  name: string
  color: string
  stockCount: number
  createdAt: string
}

export interface WatchlistGroupInput {
  name: string
  color?: string
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

  // 分组管理
  getGroups: () => {
    return request.get<ApiResponse<WatchlistGroup[]>>('/watchlist/groups')
  },

  createGroup: (data: WatchlistGroupInput) => {
    return request.post<ApiResponse<WatchlistGroup>>('/watchlist/groups', data)
  },

  updateGroup: (id: string, data: WatchlistGroupInput) => {
    return request.put<ApiResponse<WatchlistGroup>>(`/watchlist/groups/${id}`, data)
  },

  deleteGroup: (id: string) => {
    return request.delete<ApiResponse<void>>(`/watchlist/groups/${id}`)
  },

  getStocksByGroup: (groupId: string) => {
    return request.get<ApiResponse<WatchlistStock[]>>(`/watchlist/groups/${groupId}/stocks`)
  },
}
