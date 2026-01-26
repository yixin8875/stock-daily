import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { DashboardData, TodayOverview, PeriodStats, RecentDiary, TomorrowPlanOverview } from '@/types/dashboard'
import dayjs from 'dayjs'

// 获取星期几的中文名称
const getWeekdayName = (date: string): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(date).day()]
}

export const dashboardService = {
  // 获取首页概览数据
  getDashboardData: async (): Promise<DashboardData> => {
    const today = dayjs().format('YYYY-MM-DD')

    // 并行请求多个接口
    const [todayRes, weekRes, monthRes, diariesRes, planRes] = await Promise.all([
      // 今日日记
      request.get<ApiResponse<unknown>>(`/diaries/${today}`).catch(() => ({ data: { data: null } })),
      // 本周统计
      request.get<ApiResponse<unknown>>('/statistics/summary', { params: { period: 'week' } }).catch(() => ({ data: { data: null } })),
      // 本月统计
      request.get<ApiResponse<unknown>>('/statistics/summary', { params: { period: 'month' } }).catch(() => ({ data: { data: null } })),
      // 最近日记列表
      request.get<ApiResponse<{ data: unknown[]; pagination: unknown }>>('/diaries', { params: { limit: 5 } }).catch(() => ({ data: { data: { data: [] } } })),
      // 今日明日计划
      request.get<ApiResponse<unknown>>(`/diaries/detail/${today}`).catch(() => ({ data: { data: null } })),
    ])

    // 解析今日概览
    const todayDiary = todayRes.data?.data as Record<string, unknown> | null
    const todayOverview: TodayOverview = {
      date: today,
      weekday: getWeekdayName(today),
      todayProfit: todayDiary?.profitLossAmount ? Number(todayDiary.profitLossAmount) : null,
      todayProfitRate: todayDiary?.profitLossPercent ? Number(todayDiary.profitLossPercent) : null,
      tradeCount: Array.isArray(todayDiary?.trades) ? todayDiary.trades.length : 0,
      hasDiaryRecord: !!todayDiary,
    }

    // 解析周/月统计
    const weekData = weekRes.data?.data as Record<string, unknown> | null
    const monthData = monthRes.data?.data as Record<string, unknown> | null
    const periodStats: PeriodStats = {
      weekProfit: weekData?.totalProfit ? Number(weekData.totalProfit) : 0,
      monthProfit: monthData?.totalProfit ? Number(monthData.totalProfit) : 0,
      weekWinRate: weekData?.winRate ? Number(weekData.winRate) : 0,
      monthWinRate: monthData?.winRate ? Number(monthData.winRate) : 0,
      weekTradeDays: weekData?.tradeDays ? Number(weekData.tradeDays) : 0,
      monthTradeDays: monthData?.tradeDays ? Number(monthData.tradeDays) : 0,
    }

    // 解析最近日记
    const diariesData = diariesRes.data?.data as { data?: unknown[] } | null
    const diariesList = Array.isArray(diariesData?.data) ? diariesData.data : []
    const recentDiaries: RecentDiary[] = diariesList.slice(0, 5).map((diary: unknown) => {
      const d = diary as Record<string, unknown>
      return {
        id: d.id as number | string,
        date: typeof d.date === 'string' ? d.date : dayjs(d.date as string).format('YYYY-MM-DD'),
        todayProfit: d.profitLossAmount ? Number(d.profitLossAmount) : null,
        todayProfitRate: d.profitLossPercent ? Number(d.profitLossPercent) : null,
        summary: (d.marketComment as string) || (d.learningNote as string) || '暂无摘要',
      }
    })

    // 解析明日计划
    const planData = planRes.data?.data as { plan?: Record<string, unknown[]> } | null
    const plan = planData?.plan
    const tomorrowPlan: TomorrowPlanOverview = {
      watchStockCount: Array.isArray(plan?.watchStocks) ? plan.watchStocks.length : 0,
      buyPlanCount: Array.isArray(plan?.buyPlans) ? plan.buyPlans.length : 0,
      sellPlanCount: Array.isArray(plan?.sellPlans) ? plan.sellPlans.length : 0,
      stopLossCount: Array.isArray(plan?.stopLosses) ? plan.stopLosses.length : 0,
      hasPlan: !!(plan && (
        (plan.watchStocks?.length || 0) > 0 ||
        (plan.buyPlans?.length || 0) > 0 ||
        (plan.sellPlans?.length || 0) > 0 ||
        (plan.stopLosses?.length || 0) > 0
      )),
    }

    return {
      todayOverview,
      periodStats,
      recentDiaries,
      tomorrowPlan,
    }
  },
}
