import { create } from 'zustand'
import { message } from 'antd'
import { statisticsService } from '@/services/statistics'
import type {
  StatisticsPeriod,
  CoreMetrics,
  TradeStats,
  ProfitCurvePoint,
  TradeDistribution,
  MonthlyProfit,
} from '@/types/statistics'

interface StatisticsState {
  // 当前周期
  period: StatisticsPeriod
  // 核心指标
  coreMetrics: CoreMetrics | null
  coreMetricsLoading: boolean
  // 交易统计
  tradeStats: TradeStats | null
  // 收益曲线
  profitCurve: ProfitCurvePoint[]
  profitCurveLoading: boolean
  // 交易分布
  tradeDistribution: {
    profitLoss: TradeDistribution[]
    strategy: TradeDistribution[]
  }
  tradeDistributionLoading: boolean
  // 月度收益
  monthlyProfit: MonthlyProfit[]
  monthlyProfitLoading: boolean
  // Actions
  setPeriod: (period: StatisticsPeriod) => void
  fetchSummary: () => Promise<void>
  fetchProfitCurve: () => Promise<void>
  fetchTradeDistribution: () => Promise<void>
  fetchMonthlyProfit: () => Promise<void>
  fetchAllData: () => Promise<void>
}

export const useStatisticsStore = create<StatisticsState>()((set, get) => ({
  period: 'month',
  coreMetrics: null,
  coreMetricsLoading: false,
  tradeStats: null,
  profitCurve: [],
  profitCurveLoading: false,
  tradeDistribution: { profitLoss: [], strategy: [] },
  tradeDistributionLoading: false,
  monthlyProfit: [],
  monthlyProfitLoading: false,

  setPeriod: (period) => {
    set({ period })
    get().fetchAllData()
  },

  fetchSummary: async () => {
    const { period } = get()
    set({ coreMetricsLoading: true })
    try {
      const response = await statisticsService.getSummary(period)
      const data = response.data.data
      set({
        coreMetrics: data?.coreMetrics || null,
        tradeStats: data?.tradeStats || null,
      })
    } catch (error) {
      console.error('Failed to fetch summary:', error)
      message.error('获取统计摘要失败')
    } finally {
      set({ coreMetricsLoading: false })
    }
  },

  fetchProfitCurve: async () => {
    const { period } = get()
    set({ profitCurveLoading: true })
    try {
      const response = await statisticsService.getProfitCurve(period)
      set({ profitCurve: response.data.data?.data || [] })
    } catch (error) {
      console.error('Failed to fetch profit curve:', error)
      message.error('获取收益曲线失败')
    } finally {
      set({ profitCurveLoading: false })
    }
  },

  fetchTradeDistribution: async () => {
    const { period } = get()
    set({ tradeDistributionLoading: true })
    try {
      const response = await statisticsService.getTradeDistribution(period)
      const data = response.data.data
      set({
        tradeDistribution: {
          profitLoss: data?.profitLoss || [],
          strategy: data?.strategy || [],
        },
      })
    } catch (error) {
      console.error('Failed to fetch trade distribution:', error)
      message.error('获取交易分布失败')
    } finally {
      set({ tradeDistributionLoading: false })
    }
  },

  fetchMonthlyProfit: async () => {
    const { period } = get()
    set({ monthlyProfitLoading: true })
    try {
      const response = await statisticsService.getMonthlyProfit(period)
      set({ monthlyProfit: response.data.data?.data || [] })
    } catch (error) {
      console.error('Failed to fetch monthly profit:', error)
      message.error('获取月度收益失败')
    } finally {
      set({ monthlyProfitLoading: false })
    }
  },

  fetchAllData: async () => {
    const { fetchSummary, fetchProfitCurve, fetchTradeDistribution, fetchMonthlyProfit } = get()
    await Promise.all([
      fetchSummary(),
      fetchProfitCurve(),
      fetchTradeDistribution(),
      fetchMonthlyProfit(),
    ])
  },
}))
