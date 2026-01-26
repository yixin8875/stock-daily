import { create } from 'zustand'
import { message } from 'antd'
import { dashboardService } from '@/services/dashboard'
import type { DashboardData, TodayOverview, PeriodStats, RecentDiary, TomorrowPlanOverview } from '@/types/dashboard'

interface DashboardState {
  loading: boolean
  todayOverview: TodayOverview | null
  periodStats: PeriodStats | null
  recentDiaries: RecentDiary[]
  tomorrowPlan: TomorrowPlanOverview | null
  fetchDashboardData: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  loading: false,
  todayOverview: null,
  periodStats: null,
  recentDiaries: [],
  tomorrowPlan: null,

  fetchDashboardData: async () => {
    set({ loading: true })
    try {
      const data: DashboardData = await dashboardService.getDashboardData()
      set({
        todayOverview: data.todayOverview,
        periodStats: data.periodStats,
        recentDiaries: data.recentDiaries,
        tomorrowPlan: data.tomorrowPlan,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      message.error('获取首页数据失败')
    } finally {
      set({ loading: false })
    }
  },
}))
