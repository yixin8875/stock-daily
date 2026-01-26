// API Response Types
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// User Types
export interface User {
  id: number
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

// Auth Types
export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}
