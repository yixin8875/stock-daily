import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type {
  StatisticsPeriod,
  StatisticsSummaryResponse,
  ProfitCurveResponse,
  TradeDistributionResponse,
  MonthlyProfitResponse,
  WinRateTrendResponse,
  EmotionProfitResponse,
  AdvancedMetricsResponse,
  ProfitAttributionResponse,
  RiskWarningsResponse,
  IndexCompareResponse,
  HeatmapResponse,
  CashFlowResponse,
  ReviewCalendarResponse,
  HoldingPeriodResponse,
  TimingAnalysisResponse,
} from '@/types/statistics'

export const statisticsService = {
  // 获取统计摘要（核心指标 + 交易统计）
  getSummary: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<StatisticsSummaryResponse>>('/statistics/summary', {
      params: { period },
    })
  },

  // 获取收益曲线数据
  getProfitCurve: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<ProfitCurveResponse>>('/statistics/profit', {
      params: { period },
    })
  },

  // 获取交易分布数据
  getTradeDistribution: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<TradeDistributionResponse>>('/statistics/trades', {
      params: { period },
    })
  },

  // 获取月度收益数据
  getMonthlyProfit: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<MonthlyProfitResponse>>('/statistics/monthly', {
      params: { period },
    })
  },

  // 获取胜率趋势数据
  getWinRateTrend: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<WinRateTrendResponse>>('/statistics/win-rate-trend', {
      params: { period },
    })
  },

  // 获取情绪与收益分析数据
  getEmotionProfitAnalysis: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<EmotionProfitResponse>>('/statistics/emotion-analysis', {
      params: { period },
    })
  },

  // 获取高级交易指标
  getAdvancedMetrics: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<AdvancedMetricsResponse>>('/statistics/advanced-metrics', {
      params: { period },
    })
  },

  // 获取收益归因分析
  getProfitAttribution: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<ProfitAttributionResponse>>('/statistics/profit-attribution', {
      params: { period },
    })
  },

  // 获取风险预警
  getRiskWarnings: () => {
    return request.get<ApiResponse<RiskWarningsResponse>>('/statistics/risk-warnings')
  },

  // 标记预警已读
  markWarningRead: (warningId: string) => {
    return request.put<ApiResponse<void>>(`/statistics/risk-warnings/${warningId}/read`)
  },

  // 获取指数对比数据
  getIndexCompare: (period: StatisticsPeriod, indexCode = '000300') => {
    return request.get<ApiResponse<IndexCompareResponse>>('/statistics/index-compare', {
      params: { period, indexCode },
    })
  },

  // 获取热力图数据
  getHeatmap: (year?: number) => {
    return request.get<ApiResponse<HeatmapResponse>>('/statistics/heatmap', {
      params: { year },
    })
  },

  // 获取资金流向数据
  getCashFlow: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<CashFlowResponse>>('/statistics/cash-flow', {
      params: { period },
    })
  },

  // 获取交易复盘日历数据
  getReviewCalendar: (month: string) => {
    return request.get<ApiResponse<ReviewCalendarResponse>>('/statistics/review-calendar', {
      params: { month },
    })
  },

  // 获取持仓周期分析
  getHoldingPeriodAnalysis: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<HoldingPeriodResponse>>('/statistics/holding-period', {
      params: { period },
    })
  },

  // 获取交易时机分析
  getTimingAnalysis: (period: StatisticsPeriod) => {
    return request.get<ApiResponse<TimingAnalysisResponse>>('/statistics/timing-analysis', {
      params: { period },
    })
  },
}
