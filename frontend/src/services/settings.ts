import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface UserSettings {
  id: string
  dashboardLayout?: object
  screenFilters?: object
  compareStocks?: string[]
  gridCalculator?: object
  dipCalculator?: object
}

export const settingsService = {
  get: () => request.get<ApiResponse<UserSettings>>('/settings'),
  update: (data: Partial<UserSettings>) =>
    request.put<ApiResponse<UserSettings>>('/settings', data),
}
