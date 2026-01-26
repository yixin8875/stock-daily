import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { Tag, CreateTagParams, UpdateTagParams } from '@/types/tag'

export const tagService = {
  // 获取所有标签
  getTags: () => {
    return request.get<ApiResponse<Tag[]>>('/tags')
  },

  // 获取单个标签
  getTag: (id: number) => {
    return request.get<ApiResponse<Tag>>(`/tags/${id}`)
  },

  // 创建标签
  createTag: (params: CreateTagParams) => {
    return request.post<ApiResponse<Tag>>('/tags', params)
  },

  // 更新标签
  updateTag: (id: number, params: UpdateTagParams) => {
    return request.put<ApiResponse<Tag>>(`/tags/${id}`, params)
  },

  // 删除标签
  deleteTag: (id: number) => {
    return request.delete<ApiResponse<null>>(`/tags/${id}`)
  },

  // 初始化预设标签
  initTags: () => {
    return request.post<ApiResponse<Tag[]>>('/tags/init')
  },
}
