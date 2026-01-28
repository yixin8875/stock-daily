import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface LearningNote {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
  category: string
  tags?: string[]
}

export const noteService = {
  getAll: (category?: string) =>
    request.get<ApiResponse<LearningNote[]>>('/notes', { params: { category } }),
  create: (data: NoteInput) =>
    request.post<ApiResponse<LearningNote>>('/notes', data),
  update: (id: string, data: Partial<NoteInput>) =>
    request.put<ApiResponse<LearningNote>>(`/notes/${id}`, data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/notes/${id}`),
}
