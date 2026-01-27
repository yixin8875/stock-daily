import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface TradingAccount {
  id: string
  userId: string
  name: string
  broker: string | null
  accountNo: string | null
  initialAssets: number | null
  currentAssets: number | null
  isDefault: boolean
  isActive: boolean
  color: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAccountParams {
  name: string
  broker?: string
  accountNo?: string
  initialAssets?: number
  color?: string
  notes?: string
  isDefault?: boolean
}

export interface UpdateAccountParams {
  name?: string
  broker?: string
  accountNo?: string
  initialAssets?: number
  currentAssets?: number
  color?: string
  notes?: string
  isDefault?: boolean
  isActive?: boolean
}

export interface AccountStats {
  accountId: string
  accountName: string
  initialAssets: number
  currentAssets: number
  totalProfit: number
  profitRate: number
}

export const accountService = {
  // 获取所有交易账户
  getAccounts: () => {
    return request.get<ApiResponse<TradingAccount[]>>('/accounts')
  },

  // 获取单个账户
  getAccount: (id: string) => {
    return request.get<ApiResponse<TradingAccount>>(`/accounts/${id}`)
  },

  // 创建交易账户
  createAccount: (params: CreateAccountParams) => {
    return request.post<ApiResponse<TradingAccount>>('/accounts', params)
  },

  // 更新交易账户
  updateAccount: (id: string, params: UpdateAccountParams) => {
    return request.put<ApiResponse<TradingAccount>>(`/accounts/${id}`, params)
  },

  // 删除交易账户
  deleteAccount: (id: string) => {
    return request.delete(`/accounts/${id}`)
  },

  // 获取账户统计
  getAccountStats: (id: string) => {
    return request.get<ApiResponse<AccountStats>>(`/accounts/${id}/stats`)
  },
}
