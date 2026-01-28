import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface DividendRecord {
  id: string
  stockCode: string
  stockName: string
  exDate: string
  dividendType: string
  amount: number
  shares?: number
  totalAmount?: number
  notes?: string
  createdAt: string
}

export interface DividendInput {
  stockCode: string
  stockName: string
  exDate: string
  dividendType: string
  amount: number
  shares?: number
  totalAmount?: number
  notes?: string
}

export const dividendService = {
  getAll: () => request.get<ApiResponse<DividendRecord[]>>('/dividends'),
  create: (data: DividendInput) =>
    request.post<ApiResponse<DividendRecord>>('/dividends', data),
  update: (id: string, data: Partial<DividendInput>) =>
    request.put<ApiResponse<DividendRecord>>(`/dividends/${id}`, data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/dividends/${id}`),
}
