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

export interface KLineData {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
}

export interface StockNews {
  id: string
  title: string
  summary: string
  source: string
  time: string
  url: string
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

  // 获取K线数据
  getKLineData: (code: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    return request.get<ApiResponse<KLineData[]>>(`/stocks/${code}/kline`, {
      params: { period },
    })
  },

  // 获取股票新闻
  getStockNews: (code?: string) => {
    return request.get<ApiResponse<StockNews[]>>('/stocks/news', {
      params: code ? { code } : {},
    })
  },
}
