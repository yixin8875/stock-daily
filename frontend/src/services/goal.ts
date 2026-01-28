import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface InvestmentGoal {
  id: string
  title: string
  targetValue: number
  currentValue: number
  deadline?: string
  category: string
  isCompleted: boolean
  createdAt: string
}

export interface GoalInput {
  title: string
  targetValue: number
  currentValue?: number
  deadline?: string
  category: string
}

export const goalService = {
  getAll: () => request.get<ApiResponse<InvestmentGoal[]>>('/goals'),
  create: (data: GoalInput) => request.post<ApiResponse<InvestmentGoal>>('/goals', data),
  update: (id: string, data: Partial<GoalInput & { isCompleted: boolean }>) =>
    request.put<ApiResponse<InvestmentGoal>>(`/goals/${id}`, data),
  delete: (id: string) => request.delete<ApiResponse<void>>(`/goals/${id}`),
}
