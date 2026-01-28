import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface SimulatedAccount {
  id: string
  initialBalance: number
  currentBalance: number
}

export interface SimulatedTrade {
  id: string
  stockName: string
  tradeType: string
  price: number
  quantity: number
  amount: number
  balance: number
  createdAt: string
}

export interface SimTradeInput {
  stockName: string
  tradeType: string
  price: number
  quantity: number
}

export const simulatorService = {
  getAccount: () =>
    request.get<ApiResponse<SimulatedAccount>>('/simulator/account'),
  getTrades: () =>
    request.get<ApiResponse<SimulatedTrade[]>>('/simulator/trades'),
  createTrade: (data: SimTradeInput) =>
    request.post<ApiResponse<SimulatedTrade>>('/simulator/trades', data),
  reset: () =>
    request.post<ApiResponse<void>>('/simulator/reset'),
}
