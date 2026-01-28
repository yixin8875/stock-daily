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

// 板块数据
export interface SectorData {
  code: string
  name: string
  change: number
  changePercent: number
  leadingStock: string
  leadingStockChange: number
  volume: number
  amount: number
}

// 板块轮动数据
export interface SectorRotation {
  date: string
  sectors: SectorData[]
}

// 资金流向数据
export interface MoneyFlow {
  code: string
  name: string
  mainInflow: number
  mainOutflow: number
  mainNet: number
  retailInflow: number
  retailOutflow: number
  retailNet: number
  totalNet: number
  mainNetRatio: number
}

// 资金流向历史
export interface MoneyFlowHistory {
  date: string
  mainNet: number
  retailNet: number
  totalNet: number
}

// 股票筛选条件
export interface StockScreenerParams {
  minPrice?: number
  maxPrice?: number
  minPE?: number
  maxPE?: number
  minPB?: number
  maxPB?: number
  minMarketCap?: number
  maxMarketCap?: number
  minChangePercent?: number
  maxChangePercent?: number
  minVolume?: number
  sectors?: string[]
}

// 筛选结果
export interface ScreenerResult {
  code: string
  name: string
  price: number
  changePercent: number
  pe: number
  pb: number
  marketCap: number
  volume: number
  sector: string
}

// 技术指标
export interface TechnicalIndicators {
  code: string
  macd: { dif: number; dea: number; macd: number }
  kdj: { k: number; d: number; j: number }
  rsi: { rsi6: number; rsi12: number; rsi24: number }
  ma: { ma5: number; ma10: number; ma20: number; ma60: number }
  boll: { upper: number; middle: number; lower: number }
}

// 大盘情绪指标
export interface MarketSentiment {
  date: string
  advanceCount: number
  declineCount: number
  flatCount: number
  advanceDeclineRatio: number
  limitUpCount: number
  limitDownCount: number
  averageChange: number
  volumeRatio: number
  sentimentScore: number
  sentimentLevel: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed'
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

  // 获取板块列表
  getSectors: () => {
    return request.get<ApiResponse<SectorData[]>>('/market/sectors')
  },

  // 获取板块轮动数据
  getSectorRotation: (days = 5) => {
    return request.get<ApiResponse<SectorRotation[]>>('/market/sector-rotation', {
      params: { days },
    })
  },

  // 获取大盘情绪指标
  getMarketSentiment: () => {
    return request.get<ApiResponse<MarketSentiment>>('/market/sentiment')
  },

  // 获取历史情绪数据
  getSentimentHistory: (days = 30) => {
    return request.get<ApiResponse<MarketSentiment[]>>('/market/sentiment/history', {
      params: { days },
    })
  },

  // 获取资金流向
  getMoneyFlow: (codes?: string[]) => {
    return request.get<ApiResponse<MoneyFlow[]>>('/market/money-flow', {
      params: codes ? { codes: codes.join(',') } : {},
    })
  },

  // 获取资金流向历史
  getMoneyFlowHistory: (code: string, days = 30) => {
    return request.get<ApiResponse<MoneyFlowHistory[]>>(`/stocks/${code}/money-flow`, {
      params: { days },
    })
  },

  // 股票筛选
  screenStocks: (params: StockScreenerParams) => {
    return request.post<ApiResponse<ScreenerResult[]>>('/stocks/screener', params)
  },

  // 获取技术指标
  getTechnicalIndicators: (code: string) => {
    return request.get<ApiResponse<TechnicalIndicators>>(`/stocks/${code}/indicators`)
  },
}
