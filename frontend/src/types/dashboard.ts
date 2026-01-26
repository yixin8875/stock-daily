// 首页概览数据类型

// 今日概览
export interface TodayOverview {
  date: string
  weekday: string
  todayProfit: number | null
  todayProfitRate: number | null
  tradeCount: number
  hasDiaryRecord: boolean
}

// 周/月统计
export interface PeriodStats {
  weekProfit: number
  monthProfit: number
  weekWinRate: number
  monthWinRate: number
  weekTradeDays: number
  monthTradeDays: number
}

// 最近日记
export interface RecentDiary {
  id: number | string
  date: string
  todayProfit: number | null
  todayProfitRate: number | null
  summary: string
}

// 明日计划概览
export interface TomorrowPlanOverview {
  watchStockCount: number
  buyPlanCount: number
  sellPlanCount: number
  stopLossCount: number
  hasPlan: boolean
}

// 首页完整数据
export interface DashboardData {
  todayOverview: TodayOverview
  periodStats: PeriodStats
  recentDiaries: RecentDiary[]
  tomorrowPlan: TomorrowPlanOverview
}
