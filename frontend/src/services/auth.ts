import request from '@/utils/request'
import type { LoginParams, RegisterParams, AuthResponse, ApiResponse } from '@/types'

export const authService = {
  login: (params: LoginParams) => {
    return request.post<ApiResponse<AuthResponse>>('/auth/login', params)
  },

  register: (params: RegisterParams) => {
    return request.post<ApiResponse<AuthResponse>>('/auth/register', params)
  },

  logout: () => {
    return request.post<ApiResponse<null>>('/auth/logout')
  },

  getCurrentUser: () => {
    return request.get<ApiResponse<AuthResponse['user']>>('/auth/me')
  },
}
