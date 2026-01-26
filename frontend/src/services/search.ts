import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { SearchResultData, SearchParams } from '@/types/search'

export const searchService = {
  // 全文搜索
  search: (params: SearchParams) => {
    return request.get<ApiResponse<SearchResultData>>('/search', { params })
  },
}
