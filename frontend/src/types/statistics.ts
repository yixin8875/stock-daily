// 统计周期类型
export type StatisticsPeriod = 'week' | 'month' | 'year' | 'all'

// 核心指标数据
export interface CoreMetrics {
  // 胜率
  winRate: number
  winCount: number
  lossCount: number
  totalCount: number
  // 盈亏比
  profitLossRatio: number
  avgProfit: number
  avgLoss: number
  // 总收益
  totalProfit: number
  totalProfitRate: number
  // 最大回撤
  maxDrawdown: number
  maxDrawdownRate: number
}

// 收益曲线数据点
export interface ProfitCurvePoint {
  date: string
  profit: number
  profitRate: number
}

// 交易分布数据
export interface TradeDistribution {
  name: string
  value: number
  type: 'profit' | 'loss' | 'strategy'
}

// 月度收益数据
export interface MonthlyProfit {
  month: string
  profit: number
  profitRate: number
}

// 交易统计详情
export interface TradeStats {
  totalTrades: number
  profitTrades: number
  lossTrades: number
  maxSingleProfit: number
  maxSingleLoss: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  avgHoldingDays: number
}

// 统计摘要响应
export interface StatisticsSummaryResponse {
  coreMetrics: CoreMetrics
  tradeStats: TradeStats
}

// 收益曲线响应
export interface ProfitCurveResponse {
  data: ProfitCurvePoint[]
}

// 交易分布响应
export interface TradeDistributionResponse {
  profitLoss: TradeDistribution[]
  strategy: TradeDistribution[]
}

// 月度收益响应
export interface MonthlyProfitResponse {
  data: MonthlyProfit[]
}

// 胜率趋势数据点
export interface WinRateTrendPoint {
  date: string
  winRate: number
  totalTrades: number
  winningTrades: number
}

// 胜率趋势响应
export interface WinRateTrendResponse {
  data: WinRateTrendPoint[]
}

// 情绪与收益分析数据
export interface EmotionProfitData {
  emotion: string
  emotionLabel: string
  totalDays: number
  winningDays: number
  losingDays: number
  winRate: number
  avgProfit: number
  totalProfit: number
}

// 情绪与收益分析响应
export interface EmotionProfitResponse {
  data: EmotionProfitData[]
}
