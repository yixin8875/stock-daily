// 报告周期类型
export type ReportPeriod = 'week' | 'month'

// 股票表现
export interface StockPerformance {
  stockCode: string
  stockName: string
  profit: number
  profitRate: number
  tradeCount: number
  winCount: number
  lossCount: number
}

// 收益汇总
export interface ProfitSummary {
  totalProfit: number
  totalLoss: number
  netProfit: number
  profitRate: number
  winRate: number
  tradingDays: number
}

// 情绪统计
export interface EmotionStats {
  emotion: string
  count: number
  avgProfit: number
}

// 每日盈亏
export interface DailyProfit {
  date: string
  profit: number
  profitRate: number
}

// 学习笔记
export interface LearningItem {
  category: string
  content: string
  date: string
}

// 反思项
export interface ReflectionItem {
  type: 'good' | 'bad' | 'improve'
  content: string
  date: string
}

// 周期报告
export interface PeriodReport {
  period: ReportPeriod
  startDate: string
  endDate: string
  profitSummary: ProfitSummary
  stockPerformance: StockPerformance[]
  emotionStats: EmotionStats[]
  dailyProfits: DailyProfit[]
  learnings: LearningItem[]
  reflections: ReflectionItem[]
}

// 报告元数据
export interface ReportMeta {
  startDate: string
  endDate: string
  netProfit: number
  tradingDays: number
}
