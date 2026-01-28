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

// 高级交易指标
export interface AdvancedMetrics {
  // 基础指标
  winRate: number
  profitLossRatio: number
  // 期望值 = 胜率 * 平均盈利 - (1-胜率) * 平均亏损
  expectancy: number
  // 凯利公式建议仓位
  kellyPercent: number
  // 夏普比率
  sharpeRatio: number
  // 索提诺比率（只考虑下行风险）
  sortinoRatio: number
  // 卡玛比率 = 年化收益率 / 最大回撤
  calmarRatio: number
  // 最大回撤
  maxDrawdown: number
  maxDrawdownRate: number
  maxDrawdownDays: number
  // 平均持仓天数
  avgHoldingDays: number
  // 交易频率（每月）
  tradeFrequency: number
  // 连续盈亏
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  currentStreak: number
  currentStreakType: 'win' | 'loss' | 'none'
}

// 收益归因数据
export interface ProfitAttribution {
  // 按行业归因
  byIndustry: IndustryAttribution[]
  // 按个股归因
  byStock: StockAttribution[]
  // 按策略归因
  byStrategy: StrategyAttribution[]
}

export interface IndustryAttribution {
  industry: string
  profit: number
  profitRate: number
  contribution: number // 贡献度百分比
  tradeCount: number
  winRate: number
}

export interface StockAttribution {
  stockCode: string
  stockName: string
  profit: number
  profitRate: number
  contribution: number
  tradeCount: number
  winRate: number
  avgHoldingDays: number
}

export interface StrategyAttribution {
  strategy: string
  profit: number
  profitRate: number
  contribution: number
  tradeCount: number
  winRate: number
}

// 风险预警
export interface RiskWarning {
  id: string
  type: 'DRAWDOWN' | 'CONSECUTIVE_LOSS' | 'OVERTRADING' | 'CONCENTRATION' | 'VOLATILITY'
  level: 'info' | 'warning' | 'danger'
  title: string
  message: string
  value: number
  threshold: number
  createdAt: string
  isRead: boolean
}

// 高级指标响应
export interface AdvancedMetricsResponse {
  metrics: AdvancedMetrics
}

// 收益归因响应
export interface ProfitAttributionResponse {
  data: ProfitAttribution
}

// 风险预警响应
export interface RiskWarningsResponse {
  warnings: RiskWarning[]
  summary: {
    total: number
    danger: number
    warning: number
    info: number
  }
}

// 指数对比数据
export interface IndexComparePoint {
  date: string
  profit: number
  profitRate: number
  indexValue: number
  indexRate: number
}

export interface IndexCompareResponse {
  data: IndexComparePoint[]
  indexName: string
  indexCode: string
}

// 热力图数据
export interface HeatmapData {
  date: string
  profit: number
  tradeCount: number
  week: number
  dayOfWeek: number
}

export interface HeatmapResponse {
  data: HeatmapData[]
  year: number
}

// 资金流向数据
export interface CashFlowPoint {
  date: string
  inflow: number
  outflow: number
  netFlow: number
  balance: number
}

export interface CashFlowResponse {
  data: CashFlowPoint[]
  summary: {
    totalInflow: number
    totalOutflow: number
    netFlow: number
    currentBalance: number
  }
}

// 交易复盘日历数据
export interface ReviewCalendarDay {
  date: string
  profit: number
  profitRate: number
  tradeCount: number
  trades: ReviewCalendarTrade[]
}

export interface ReviewCalendarTrade {
  id: string
  stockCode: string
  stockName: string
  type: 'BUY' | 'SELL'
  price: number
  quantity: number
  profit?: number
  profitRate?: number
}

export interface ReviewCalendarResponse {
  data: ReviewCalendarDay[]
  month: string
  summary: {
    totalProfit: number
    tradingDays: number
    winDays: number
    lossDays: number
  }
}

// 持仓周期分析
export interface HoldingPeriodData {
  period: string
  periodLabel: string
  tradeCount: number
  winRate: number
  avgProfit: number
  avgProfitRate: number
  totalProfit: number
}

export interface HoldingPeriodResponse {
  data: HoldingPeriodData[]
  optimal: {
    period: string
    periodLabel: string
    reason: string
  }
}

// 交易时机分析
export interface TimingAnalysisData {
  type: 'buy' | 'sell'
  accuracy: number
  avgDeviation: number
  bestTiming: number
  worstTiming: number
  suggestions: string[]
}

export interface TimingAnalysisResponse {
  buyTiming: TimingAnalysisData
  sellTiming: TimingAnalysisData
  overallScore: number
}

// 交易错误类型
export type TradeErrorType = 'CHASE_HIGH' | 'PANIC_SELL' | 'HOLD_LOSS' | 'EARLY_SELL' | 'OVERTRADING' | 'NO_STOP_LOSS'

// 交易错误分析
export interface TradeError {
  type: TradeErrorType
  label: string
  count: number
  totalLoss: number
  examples: TradeErrorExample[]
  suggestion: string
}

export interface TradeErrorExample {
  tradeId: string
  stockCode: string
  stockName: string
  date: string
  loss: number
  description: string
}

export interface TradeErrorResponse {
  errors: TradeError[]
  totalErrorCount: number
  mostCommonError: TradeErrorType
}

// 最佳/最差交易
export interface TopTrade {
  id: string
  stockCode: string
  stockName: string
  buyDate: string
  sellDate: string
  buyPrice: number
  sellPrice: number
  quantity: number
  profit: number
  profitRate: number
  holdingDays: number
  strategy?: string
}

export interface TopTradesResponse {
  bestTrades: TopTrade[]
  worstTrades: TopTrade[]
}
