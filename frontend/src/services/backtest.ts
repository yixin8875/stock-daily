import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface BacktestTrade {
  stockCode: string
  stockName: string
  buyDate: string
  buyPrice: number
  sellDate: string
  sellPrice: number
  profit: number
  profitRate: number
  holdingDays: number
}

export interface BacktestResult {
  strategyName: string
  period: { start: string; end: string }
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  totalProfitRate: number
  maxDrawdown: number
  maxDrawdownRate: number
  profitFactor: number
  avgProfit: number
  avgLoss: number
  avgHoldingDays: number
  trades: BacktestTrade[]
}

export const backtestService = {
  // 运行策略回测
  runBacktest: (strategyType?: string, startDate?: string, endDate?: string) => {
    return request.get<ApiResponse<BacktestResult>>('/backtest', {
      params: { strategyType, startDate, endDate },
    })
  },
}
