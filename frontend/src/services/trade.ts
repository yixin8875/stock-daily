import request from '@/utils/request'

// 交易记录类型
export interface Trade {
  id: string
  stockCode: string
  stockName: string
  direction: 'BUY' | 'SELL'
  price: number
  quantity: number
  amount: number
  reason?: string
  strategyTag?: string
  createdAt: string
  diary: {
    id: string
    date: string
  }
}

// 股票统计类型
export interface StockStatistics {
  totalTrades: number
  buyCount: number
  sellCount: number
  totalBuyAmount: number
  totalSellAmount: number
  avgBuyPrice: number
  avgSellPrice: number
  realizedProfit: number
  holdingQuantity: number
  holdingCost: number
}

// 股票历史响应
export interface StockHistoryResponse {
  trades: Trade[]
  statistics: StockStatistics
}

// 股票汇总类型
export interface StockSummary {
  stockCode: string
  stockName: string
  buyCount: number
  sellCount: number
  totalBuyAmount: number
  totalSellAmount: number
  totalBuyQuantity: number
  totalSellQuantity: number
  avgBuyPrice: number
  avgSellPrice: number
  realizedProfit: number
  holdingQuantity: number
  holdingCost: number
}

// 总体统计类型
export interface TotalStats {
  totalTrades: number
  totalBuyTrades: number
  totalSellTrades: number
  totalBuyAmount: number
  totalSellAmount: number
  totalRealizedProfit: number
  uniqueStocks: number
}

// 交易统计响应
export interface TradeStatisticsResponse {
  stockSummaries: StockSummary[]
  totalStats: TotalStats
}

// 带 success 字段的响应类型
interface SuccessResponse<T> {
  success: boolean
  data?: T
}

export const tradeService = {
  // 获取单只股票的交易历史
  getStockHistory: (stockCode: string) => {
    return request.get<SuccessResponse<never> & StockHistoryResponse>(`/trades/stock/${stockCode}/history`)
  },

  // 获取交易统计概览
  getStatistics: (params?: { startDate?: string; endDate?: string }) => {
    return request.get<SuccessResponse<never> & TradeStatisticsResponse>('/trades/statistics', { params })
  },

  // 获取交易列表
  getTrades: (params?: {
    page?: number
    limit?: number
    stockCode?: string
    startDate?: string
    endDate?: string
  }) => {
    return request.get<SuccessResponse<never> & { data: Trade[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/trades', { params })
  },

  // 获取单个交易详情
  getTradeById: (id: string) => {
    return request.get<SuccessResponse<never> & { data: Trade }>(`/trades/${id}`)
  },
}
