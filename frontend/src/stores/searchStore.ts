import { create } from 'zustand'
import { message } from 'antd'
import { searchService } from '@/services/search'
import type { SearchResultItem } from '@/types/search'

interface SearchState {
  // 搜索关键词
  keyword: string
  // 搜索结果
  results: SearchResultItem[]
  // 加载状态
  loading: boolean
  // 分页
  total: number
  page: number
  pageSize: number
  // 是否已搜索过
  hasSearched: boolean
  // Actions
  setKeyword: (keyword: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  search: (keyword?: string) => Promise<void>
  reset: () => void
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  keyword: '',
  results: [],
  loading: false,
  total: 0,
  page: 1,
  pageSize: 20,
  hasSearched: false,

  setKeyword: (keyword) => set({ keyword }),

  setPage: (page) => {
    set({ page })
    get().search()
  },

  setPageSize: (pageSize) => {
    set({ pageSize, page: 1 })
    get().search()
  },

  search: async (keyword?: string) => {
    const state = get()
    const searchKeyword = keyword !== undefined ? keyword : state.keyword

    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词')
      return
    }

    if (keyword !== undefined) {
      set({ keyword: searchKeyword, page: 1 })
    }

    set({ loading: true, hasSearched: true })
    try {
      const response = await searchService.search({
        q: searchKeyword.trim(),
        page: keyword !== undefined ? 1 : state.page,
        pageSize: state.pageSize,
      })
      const data = response.data.data
      set({
        results: data?.list || [],
        total: data?.total || 0,
        page: data?.page || 1,
      })
    } catch (error) {
      console.error('Search failed:', error)
      message.error('搜索失败，请稍后重试')
      set({ results: [], total: 0 })
    } finally {
      set({ loading: false })
    }
  },

  reset: () => {
    set({
      keyword: '',
      results: [],
      loading: false,
      total: 0,
      page: 1,
      pageSize: 20,
      hasSearched: false,
    })
  },
}))
