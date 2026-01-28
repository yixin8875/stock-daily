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
  WinRateTrendPoint,
  EmotionProfitData,
  AdvancedMetrics,
  ProfitAttribution,
  RiskWarning,
  IndexComparePoint,
  HeatmapData,
  CashFlowPoint,
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
  // 胜率趋势
  winRateTrend: WinRateTrendPoint[]
  winRateTrendLoading: boolean
  // 情绪分析
  emotionProfit: EmotionProfitData[]
  emotionProfitLoading: boolean
  // 高级指标
  advancedMetrics: AdvancedMetrics | null
  advancedMetricsLoading: boolean
  // 收益归因
  profitAttribution: ProfitAttribution | null
  profitAttributionLoading: boolean
  // 风险预警
  riskWarnings: RiskWarning[]
  riskWarningsLoading: boolean
  // 指数对比
  indexCompare: IndexComparePoint[]
  indexCompareName: string
  indexCompareLoading: boolean
  // 热力图
  heatmapData: HeatmapData[]
  heatmapYear: number
  heatmapLoading: boolean
  // 资金流向
  cashFlowData: CashFlowPoint[]
  cashFlowSummary: { totalInflow: number; totalOutflow: number; netFlow: number; currentBalance: number } | null
  cashFlowLoading: boolean
  // Actions
  setPeriod: (period: StatisticsPeriod) => void
  fetchSummary: () => Promise<void>
  fetchProfitCurve: () => Promise<void>
  fetchTradeDistribution: () => Promise<void>
  fetchMonthlyProfit: () => Promise<void>
  fetchWinRateTrend: () => Promise<void>
  fetchEmotionProfit: () => Promise<void>
  fetchAdvancedMetrics: () => Promise<void>
  fetchProfitAttribution: () => Promise<void>
  fetchRiskWarnings: () => Promise<void>
  markWarningRead: (id: string) => Promise<void>
  fetchIndexCompare: (indexCode?: string) => Promise<void>
  fetchHeatmap: (year?: number) => Promise<void>
  fetchCashFlow: () => Promise<void>
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
  winRateTrend: [],
  winRateTrendLoading: false,
  emotionProfit: [],
  emotionProfitLoading: false,
  advancedMetrics: null,
  advancedMetricsLoading: false,
  profitAttribution: null,
  profitAttributionLoading: false,
  riskWarnings: [],
  riskWarningsLoading: false,
  indexCompare: [],
  indexCompareName: '沪深300',
  indexCompareLoading: false,
  heatmapData: [],
  heatmapYear: new Date().getFullYear(),
  heatmapLoading: false,
  cashFlowData: [],
  cashFlowSummary: null,
  cashFlowLoading: false,

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

  fetchWinRateTrend: async () => {
    const { period } = get()
    set({ winRateTrendLoading: true })
    try {
      const response = await statisticsService.getWinRateTrend(period)
      set({ winRateTrend: response.data.data?.data || [] })
    } catch (error) {
      console.error('Failed to fetch win rate trend:', error)
      message.error('获取胜率趋势失败')
    } finally {
      set({ winRateTrendLoading: false })
    }
  },

  fetchEmotionProfit: async () => {
    const { period } = get()
    set({ emotionProfitLoading: true })
    try {
      const response = await statisticsService.getEmotionProfitAnalysis(period)
      set({ emotionProfit: response.data.data?.data || [] })
    } catch (error) {
      console.error('Failed to fetch emotion profit:', error)
      message.error('获取情绪分析失败')
    } finally {
      set({ emotionProfitLoading: false })
    }
  },

  fetchAdvancedMetrics: async () => {
    const { period } = get()
    set({ advancedMetricsLoading: true })
    try {
      const response = await statisticsService.getAdvancedMetrics(period)
      set({ advancedMetrics: response.data.data?.metrics || null })
    } catch (error) {
      console.error('Failed to fetch advanced metrics:', error)
    } finally {
      set({ advancedMetricsLoading: false })
    }
  },

  fetchProfitAttribution: async () => {
    const { period } = get()
    set({ profitAttributionLoading: true })
    try {
      const response = await statisticsService.getProfitAttribution(period)
      set({ profitAttribution: response.data.data?.data || null })
    } catch (error) {
      console.error('Failed to fetch profit attribution:', error)
    } finally {
      set({ profitAttributionLoading: false })
    }
  },

  fetchRiskWarnings: async () => {
    set({ riskWarningsLoading: true })
    try {
      const response = await statisticsService.getRiskWarnings()
      set({ riskWarnings: response.data.data?.warnings || [] })
    } catch (error) {
      console.error('Failed to fetch risk warnings:', error)
    } finally {
      set({ riskWarningsLoading: false })
    }
  },

  markWarningRead: async (id: string) => {
    try {
      await statisticsService.markWarningRead(id)
      const { riskWarnings } = get()
      set({
        riskWarnings: riskWarnings.map(w =>
          w.id === id ? { ...w, isRead: true } : w
        )
      })
    } catch (error) {
      console.error('Failed to mark warning read:', error)
    }
  },

  fetchIndexCompare: async (indexCode = '000300') => {
    const { period } = get()
    set({ indexCompareLoading: true })
    try {
      const response = await statisticsService.getIndexCompare(period, indexCode)
      const data = response.data.data
      set({
        indexCompare: data?.data || [],
        indexCompareName: data?.indexName || '沪深300'
      })
    } catch (error) {
      console.error('Failed to fetch index compare:', error)
    } finally {
      set({ indexCompareLoading: false })
    }
  },

  fetchHeatmap: async (year?: number) => {
    const targetYear = year || get().heatmapYear
    set({ heatmapLoading: true, heatmapYear: targetYear })
    try {
      const response = await statisticsService.getHeatmap(targetYear)
      set({ heatmapData: response.data.data?.data || [] })
    } catch (error) {
      console.error('Failed to fetch heatmap:', error)
    } finally {
      set({ heatmapLoading: false })
    }
  },

  fetchCashFlow: async () => {
    const { period } = get()
    set({ cashFlowLoading: true })
    try {
      const response = await statisticsService.getCashFlow(period)
      const data = response.data.data
      set({
        cashFlowData: data?.data || [],
        cashFlowSummary: data?.summary || null
      })
    } catch (error) {
      console.error('Failed to fetch cash flow:', error)
    } finally {
      set({ cashFlowLoading: false })
    }
  },

  fetchAllData: async () => {
    const {
      fetchSummary, fetchProfitCurve, fetchTradeDistribution,
      fetchMonthlyProfit, fetchWinRateTrend, fetchEmotionProfit,
      fetchAdvancedMetrics, fetchProfitAttribution, fetchRiskWarnings,
      fetchIndexCompare, fetchHeatmap, fetchCashFlow
    } = get()
    await Promise.all([
      fetchSummary(),
      fetchProfitCurve(),
      fetchTradeDistribution(),
      fetchMonthlyProfit(),
      fetchWinRateTrend(),
      fetchEmotionProfit(),
      fetchAdvancedMetrics(),
      fetchProfitAttribution(),
      fetchRiskWarnings(),
      fetchIndexCompare(),
      fetchHeatmap(),
      fetchCashFlow(),
    ])
  },
}))
