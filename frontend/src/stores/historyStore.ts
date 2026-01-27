import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import { message } from 'antd'
import { diaryService } from '@/services/diary'
import type { TodaySummary, TomorrowPlan, CalendarDayData } from '@/types/diary'

type ViewType = 'calendar' | 'list'

interface HistoryState {
  // 视图类型
  viewType: ViewType
  // 日历数据
  calendarData: Record<string, CalendarDayData>
  calendarLoading: boolean
  currentMonth: string
  // 列表数据
  listData: TodaySummary[]
  listLoading: boolean
  listTotal: number
  listPage: number
  listPageSize: number
  dateRange: [string | null, string | null]
  // 详情弹窗
  detailModalOpen: boolean
  detailLoading: boolean
  detailSummary: TodaySummary | null
  detailPlan: TomorrowPlan | null
  selectedDate: string | null
  // Actions
  setViewType: (type: ViewType) => void
  setCurrentMonth: (month: string) => void
  setDateRange: (range: [string | null, string | null]) => void
  setListPage: (page: number) => void
  setListPageSize: (pageSize: number) => void
  fetchCalendarData: (year: number, month: number) => Promise<void>
  fetchListData: () => Promise<void>
  openDetailModal: (date: string) => Promise<void>
  closeDetailModal: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      viewType: 'calendar',
      calendarData: {},
      calendarLoading: false,
      currentMonth: dayjs().format('YYYY-MM'),
      listData: [],
      listLoading: false,
      listTotal: 0,
      listPage: 1,
      listPageSize: 10,
      dateRange: [null, null],
      detailModalOpen: false,
      detailLoading: false,
      detailSummary: null,
      detailPlan: null,
      selectedDate: null,

      setViewType: (type) => set({ viewType: type }),

      setCurrentMonth: (month) => set({ currentMonth: month }),

      setDateRange: (range) => {
        set({ dateRange: range, listPage: 1 })
        get().fetchListData()
      },

      setListPage: (page) => {
        set({ listPage: page })
        get().fetchListData()
      },

      setListPageSize: (pageSize) => {
        set({ listPageSize: pageSize, listPage: 1 })
        get().fetchListData()
      },

      fetchCalendarData: async (year, month) => {
        set({ calendarLoading: true })
        try {
          const response = await diaryService.getCalendarData(year, month)
          set({ calendarData: response.data.data || {} })
        } catch (error) {
          console.error('Failed to fetch calendar data:', error)
          message.error('获取日历数据失败')
        } finally {
          set({ calendarLoading: false })
        }
      },

      fetchListData: async () => {
        const { listPage, listPageSize, dateRange } = get()
        set({ listLoading: true })
        try {
          const params: { page: number; pageSize: number; startDate?: string; endDate?: string } = {
            page: listPage,
            pageSize: listPageSize,
          }
          if (dateRange[0]) params.startDate = dateRange[0]
          if (dateRange[1]) params.endDate = dateRange[1]
          const response = await diaryService.getDiaryList(params)
          const data = response.data.data
          set({ listData: data?.data || [], listTotal: data?.pagination?.total || 0 })
        } catch (error) {
          console.error('Failed to fetch list data:', error)
          message.error('获取列表数据失败')
        } finally {
          set({ listLoading: false })
        }
      },

      openDetailModal: async (date) => {
        set({ detailModalOpen: true, detailLoading: true, selectedDate: date })
        try {
          const response = await diaryService.getDiaryDetail(date)
          const data = response.data.data
          // Convert plan to TomorrowPlan format if it exists
          const plan: TomorrowPlan | null = data?.plan ? {
            date: date,
            watchStocks: data.plan.watchStocks || [],
            buyPlans: data.plan.buyPlans || [],
            sellPlans: data.plan.sellPlans || [],
            stopLosses: data.plan.stopLosses || [],
            riskAlert: { riskTypes: [], description: '', countermeasures: '' },
          } : null
          set({ detailSummary: data?.summary || null, detailPlan: plan })
        } catch (error) {
          console.error('Failed to fetch diary detail:', error)
          message.error('获取日记详情失败')
        } finally {
          set({ detailLoading: false })
        }
      },

      closeDetailModal: () => {
        set({ detailModalOpen: false, detailSummary: null, detailPlan: null, selectedDate: null })
      },
    }),
    {
      name: 'history-store',
      partialize: (state) => ({ viewType: state.viewType }),
    }
  )
)
