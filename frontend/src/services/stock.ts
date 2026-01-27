import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface StockQuote {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  amount: number
  time: string
}

export interface StockSearchResult {
  code: string
  name: string
  market: string
}

export const stockService = {
  // 获取单只股票行情
  getQuote: (code: string) => {
    return request.get<ApiResponse<StockQuote>>(`/stocks/${code}`)
  },

  // 批量获取股票行情
  getQuotes: (codes: string[]) => {
    return request.get<ApiResponse<StockQuote[]>>('/stocks/quotes', {
      params: { codes: codes.join(',') },
    })
  },

  // 搜索股票
  searchStock: (keyword: string) => {
    return request.get<ApiResponse<StockSearchResult[]>>('/stocks/search', {
      params: { keyword },
    })
  },
}
