import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface UserProfile {
  id: string
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  diaryCount: number
  tradeCount: number
  memberSince: string
  firstDiaryDate: string | null
}

export interface UpdateProfileParams {
  username?: string
}

export interface ChangePasswordParams {
  currentPassword: string
  newPassword: string
}

export const userService = {
  // 获取用户资料
  getProfile: () => {
    return request.get<ApiResponse<UserProfile>>('/user/profile')
  },

  // 更新用户资料
  updateProfile: (params: UpdateProfileParams) => {
    return request.put<ApiResponse<UserProfile>>('/user/profile', params)
  },

  // 修改密码
  changePassword: (params: ChangePasswordParams) => {
    return request.put<ApiResponse<{ message: string }>>('/user/password', params)
  },

  // 获取用户统计
  getStats: () => {
    return request.get<ApiResponse<UserStats>>('/user/stats')
  },
}
