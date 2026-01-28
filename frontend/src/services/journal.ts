import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface TradingJournal {
  id: string
  date: string
  marketObservation: string
  tradingThoughts: string
  lessonsLearned: string
  emotionScore: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface TradingJournalInput {
  date: string
  marketObservation: string
  tradingThoughts: string
  lessonsLearned: string
  emotionScore: number
  tags?: string[]
}

export const journalService = {
  getJournals: (params?: { page?: number; limit?: number }) => {
    return request.get<ApiResponse<{ data: TradingJournal[]; total: number }>>('/journals', { params })
  },

  getJournal: (date: string) => {
    return request.get<ApiResponse<TradingJournal | null>>(`/journals/${date}`)
  },

  saveJournal: (data: TradingJournalInput) => {
    return request.post<ApiResponse<TradingJournal>>('/journals', data)
  },

  updateJournal: (id: string, data: Partial<TradingJournalInput>) => {
    return request.put<ApiResponse<TradingJournal>>(`/journals/${id}`, data)
  },

  deleteJournal: (id: string) => {
    return request.delete<ApiResponse<void>>(`/journals/${id}`)
  },
}
