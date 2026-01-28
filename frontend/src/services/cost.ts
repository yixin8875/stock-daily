import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface CostRecord {
  id: string
  tradeType: string
  price: number
  quantity: number
  sortOrder: number
  createdAt: string
}

export interface CostRecordInput {
  tradeType: string
  price: number
  quantity: number
}

export const costService = {
  getAll: () =>
    request.get<ApiResponse<CostRecord[]>>('/cost-records'),
  add: (data: CostRecordInput) =>
    request.post<ApiResponse<CostRecord>>('/cost-records', data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/cost-records/${id}`),
  clear: () =>
    request.delete<ApiResponse<void>>('/cost-records'),
}
