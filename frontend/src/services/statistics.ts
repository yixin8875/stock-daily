import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type {
  StatisticsPeriod,
  StatisticsSummaryResponse,
  ProfitCurveResponse,
  TradeDistributionResponse,
  MonthlyProfitResponse,
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
}
