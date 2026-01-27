// 执行指标
export interface ExecutionMetrics {
  planCount: number
  executedCount: number
  executionRate: number
  avgDeviation: number
  onTargetCount: number
  missedCount: number
}

// 计划执行匹配对
export interface PlanExecutionPair {
  planType: 'buy' | 'sell'
  stockCode: string
  stockName: string
  plannedPrice: number
  actualPrice: number | null
  plannedQuantity: number
  actualQuantity: number | null
  deviation: number | null
  status: 'executed' | 'partial' | 'missed' | 'pending'
  planReason: string | null
  tradeReason: string | null
}

// 单日复盘数据
export interface DailyReview {
  date: string
  metrics: ExecutionMetrics
  pairs: PlanExecutionPair[]
  summary: {
    totalPlannedAmount: number
    totalActualAmount: number
    profitFromPlan: number
  }
}

// 偏差趋势
export interface DeviationTrend {
  date: string
  avgDeviation: number
  executionRate: number
}
