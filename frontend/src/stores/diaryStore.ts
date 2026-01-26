import { create } from 'zustand'
import dayjs from 'dayjs'
import { message } from 'antd'
import { diaryService } from '@/services/diary'
import type {
  TodaySummary,
  MarketComment,
  TradeRecord,
  ProfitLoss,
  OperationReflection,
  EmotionRecord,
  LearningNote,
  TomorrowPlan,
  WatchStock,
  BuyPlan,
  SellPlan,
  StopLoss,
  RiskAlert,
} from '@/types/diary'

// 初始化大盘点评
const initialMarketComment: MarketComment = {
  trend: null,
  volume: null,
  hotSectors: [],
  comment: '',
}

// 初始化盈亏情况
const initialProfitLoss: ProfitLoss = {
  todayProfit: null,
  todayProfitRate: null,
  totalAssets: null,
}

// 初始化操作反思
const initialReflection: OperationReflection = {
  didRight: '',
  didWrong: '',
  improvementPlan: '',
  tags: [],
}

// 初始化情绪记录
const initialEmotion: EmotionRecord = {
  beforeOpen: null,
  duringTrading: null,
  afterClose: null,
  note: '',
}

// 初始化学习笔记
const initialLearningNote: LearningNote = {
  content: '',
  category: '',
}

// 初始化风险提示
const initialRiskAlert: RiskAlert = {
  riskTypes: [],
  description: '',
  countermeasures: '',
}

interface DiaryState {
  // 当前选择的日期
  selectedDate: string
  // 是否正在加载
  loading: boolean
  // 是否正在保存
  saving: boolean
  // 当前日记数据
  currentSummary: TodaySummary | null
  // 当前日记ID（用于关联明日计划）
  currentDiaryId: string | null
  // 表单数据
  marketComment: MarketComment
  tradeRecords: TradeRecord[]
  profitLoss: ProfitLoss
  reflection: OperationReflection
  emotion: EmotionRecord
  learningNote: LearningNote
  // 明日计划数据
  currentPlan: TomorrowPlan | null
  planLoading: boolean
  planSaving: boolean
  watchStocks: WatchStock[]
  buyPlans: BuyPlan[]
  sellPlans: SellPlan[]
  stopLosses: StopLoss[]
  riskAlert: RiskAlert
  // Actions
  setSelectedDate: (date: string) => void
  setMarketComment: (data: Partial<MarketComment>) => void
  setTradeRecords: (records: TradeRecord[]) => void
  addTradeRecord: (record: TradeRecord) => void
  removeTradeRecord: (id: string) => void
  updateTradeRecord: (id: string, data: Partial<TradeRecord>) => void
  setProfitLoss: (data: Partial<ProfitLoss>) => void
  setReflection: (data: Partial<OperationReflection>) => void
  setEmotion: (data: Partial<EmotionRecord>) => void
  setLearningNote: (data: Partial<LearningNote>) => void
  fetchSummary: (date: string) => Promise<void>
  saveSummary: () => Promise<boolean>
  resetForm: () => void
  // 明日计划 Actions
  setWatchStocks: (stocks: WatchStock[]) => void
  addWatchStock: (stock: WatchStock) => void
  removeWatchStock: (id: string) => void
  updateWatchStock: (id: string, data: Partial<WatchStock>) => void
  setBuyPlans: (plans: BuyPlan[]) => void
  addBuyPlan: (plan: BuyPlan) => void
  removeBuyPlan: (id: string) => void
  updateBuyPlan: (id: string, data: Partial<BuyPlan>) => void
  setSellPlans: (plans: SellPlan[]) => void
  addSellPlan: (plan: SellPlan) => void
  removeSellPlan: (id: string) => void
  updateSellPlan: (id: string, data: Partial<SellPlan>) => void
  setStopLosses: (losses: StopLoss[]) => void
  addStopLoss: (loss: StopLoss) => void
  removeStopLoss: (id: string) => void
  updateStopLoss: (id: string, data: Partial<StopLoss>) => void
  setRiskAlert: (data: Partial<RiskAlert>) => void
  fetchPlan: (date: string) => Promise<void>
  savePlan: () => Promise<boolean>
  resetPlanForm: () => void
}

export const useDiaryStore = create<DiaryState>()((set, get) => ({
  selectedDate: dayjs().format('YYYY-MM-DD'),
  loading: false,
  saving: false,
  currentSummary: null,
  currentDiaryId: null,
  marketComment: { ...initialMarketComment },
  tradeRecords: [],
  profitLoss: { ...initialProfitLoss },
  reflection: { ...initialReflection },
  emotion: { ...initialEmotion },
  learningNote: { ...initialLearningNote },
  // 明日计划初始状态
  currentPlan: null,
  planLoading: false,
  planSaving: false,
  watchStocks: [],
  buyPlans: [],
  sellPlans: [],
  stopLosses: [],
  riskAlert: { ...initialRiskAlert },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date })
  },

  setMarketComment: (data: Partial<MarketComment>) => {
    set((state) => ({
      marketComment: { ...state.marketComment, ...data },
    }))
  },

  setTradeRecords: (records: TradeRecord[]) => {
    set({ tradeRecords: records })
  },

  addTradeRecord: (record: TradeRecord) => {
    set((state) => ({
      tradeRecords: [...state.tradeRecords, record],
    }))
  },

  removeTradeRecord: (id: string) => {
    set((state) => ({
      tradeRecords: state.tradeRecords.filter((r) => r.id !== id),
    }))
  },

  updateTradeRecord: (id: string, data: Partial<TradeRecord>) => {
    set((state) => ({
      tradeRecords: state.tradeRecords.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    }))
  },

  setProfitLoss: (data: Partial<ProfitLoss>) => {
    set((state) => ({
      profitLoss: { ...state.profitLoss, ...data },
    }))
  },

  setReflection: (data: Partial<OperationReflection>) => {
    set((state) => ({
      reflection: { ...state.reflection, ...data },
    }))
  },

  setEmotion: (data: Partial<EmotionRecord>) => {
    set((state) => ({
      emotion: { ...state.emotion, ...data },
    }))
  },

  setLearningNote: (data: Partial<LearningNote>) => {
    set((state) => ({
      learningNote: { ...state.learningNote, ...data },
    }))
  },

  fetchSummary: async (date: string) => {
    set({ loading: true })
    try {
      const response = await diaryService.getTodaySummary(date)
      const diary = response.data.data
      if (diary) {
        // 后端返回的是数据库模型格式，需要转换为前端格式
        const summary: TodaySummary = {
          id: diary.id as unknown as number,
          date: typeof diary.date === 'string' ? diary.date : new Date(diary.date).toISOString().split('T')[0],
          marketComment: {
            trend: diary.marketTrend as MarketComment['trend'],
            volume: diary.marketVolume as MarketComment['volume'],
            hotSectors: diary.hotSectors || [],
            comment: diary.marketComment || '',
          },
          tradeRecords: diary.trades || [],
          profitLoss: {
            todayProfit: diary.profitLossAmount ? Number(diary.profitLossAmount) : null,
            todayProfitRate: diary.profitLossPercent ? Number(diary.profitLossPercent) : null,
            totalAssets: diary.totalAssets ? Number(diary.totalAssets) : null,
          },
          reflection: {
            didRight: diary.reflectionGood || '',
            didWrong: diary.reflectionBad || '',
            improvementPlan: diary.reflectionImprove || '',
            tags: diary.reflectionTags || [],
          },
          emotion: {
            beforeOpen: diary.emotionBefore as EmotionRecord['beforeOpen'],
            duringTrading: diary.emotionDuring as EmotionRecord['duringTrading'],
            afterClose: diary.emotionAfter as EmotionRecord['afterClose'],
            note: diary.emotionNote || '',
          },
          learningNote: {
            content: diary.learningNote || '',
            category: diary.learningCategory || '',
          },
          createdAt: diary.createdAt,
          updatedAt: diary.updatedAt,
        }
        set({
          currentSummary: summary,
          currentDiaryId: diary.id as string,
          marketComment: summary.marketComment,
          tradeRecords: summary.tradeRecords,
          profitLoss: summary.profitLoss,
          reflection: summary.reflection,
          emotion: summary.emotion,
          learningNote: summary.learningNote,
        })
      } else {
        // 数据为空，静默重置表单，不显示错误
        get().resetForm()
        set({ currentSummary: null, currentDiaryId: null })
      }
    } catch (error: unknown) {
      // 404 或其他错误时静默处理，不显示错误提示
      console.error('Failed to fetch summary:', error)
      get().resetForm()
      set({ currentSummary: null, currentDiaryId: null })
    } finally {
      set({ loading: false })
    }
  },

  saveSummary: async () => {
    const state = get()
    set({ saving: true })
    try {
      // 转换前端格式为后端格式
      const params = {
        id: state.currentDiaryId || undefined,
        date: state.selectedDate,
        marketTrend: state.marketComment.trend,
        marketVolume: state.marketComment.volume,
        marketComment: state.marketComment.comment,
        hotSectors: state.marketComment.hotSectors,
        profitLossAmount: state.profitLoss.todayProfit,
        profitLossPercent: state.profitLoss.todayProfitRate,
        totalAssets: state.profitLoss.totalAssets,
        reflectionGood: state.reflection.didRight,
        reflectionBad: state.reflection.didWrong,
        reflectionImprove: state.reflection.improvementPlan,
        reflectionTags: state.reflection.tags,
        emotionBefore: state.emotion.beforeOpen,
        emotionDuring: state.emotion.duringTrading,
        emotionAfter: state.emotion.afterClose,
        emotionNote: state.emotion.note,
        learningNote: state.learningNote.content,
        learningCategory: state.learningNote.category,
      }
      const response = await diaryService.saveTodaySummary(params)
      // 更新 currentDiaryId
      if (response.data.data?.id) {
        set({ currentDiaryId: response.data.data.id as string })
      }
      message.success('保存成功')
      return true
    } catch (error) {
      console.error('Failed to save summary:', error)
      message.error('保存失败')
      return false
    } finally {
      set({ saving: false })
    }
  },

  resetForm: () => {
    set({
      marketComment: { ...initialMarketComment },
      tradeRecords: [],
      profitLoss: { ...initialProfitLoss },
      reflection: { ...initialReflection },
      emotion: { ...initialEmotion },
      learningNote: { ...initialLearningNote },
    })
  },

  // 明日计划 Actions
  setWatchStocks: (stocks: WatchStock[]) => {
    set({ watchStocks: stocks })
  },

  addWatchStock: (stock: WatchStock) => {
    set((state) => ({
      watchStocks: [...state.watchStocks, stock],
    }))
  },

  removeWatchStock: (id: string) => {
    set((state) => ({
      watchStocks: state.watchStocks.filter((s) => s.id !== id),
    }))
  },

  updateWatchStock: (id: string, data: Partial<WatchStock>) => {
    set((state) => ({
      watchStocks: state.watchStocks.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }))
  },

  setBuyPlans: (plans: BuyPlan[]) => {
    set({ buyPlans: plans })
  },

  addBuyPlan: (plan: BuyPlan) => {
    set((state) => ({
      buyPlans: [...state.buyPlans, plan],
    }))
  },

  removeBuyPlan: (id: string) => {
    set((state) => ({
      buyPlans: state.buyPlans.filter((p) => p.id !== id),
    }))
  },

  updateBuyPlan: (id: string, data: Partial<BuyPlan>) => {
    set((state) => ({
      buyPlans: state.buyPlans.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }))
  },

  setSellPlans: (plans: SellPlan[]) => {
    set({ sellPlans: plans })
  },

  addSellPlan: (plan: SellPlan) => {
    set((state) => ({
      sellPlans: [...state.sellPlans, plan],
    }))
  },

  removeSellPlan: (id: string) => {
    set((state) => ({
      sellPlans: state.sellPlans.filter((p) => p.id !== id),
    }))
  },

  updateSellPlan: (id: string, data: Partial<SellPlan>) => {
    set((state) => ({
      sellPlans: state.sellPlans.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }))
  },

  setStopLosses: (losses: StopLoss[]) => {
    set({ stopLosses: losses })
  },

  addStopLoss: (loss: StopLoss) => {
    set((state) => ({
      stopLosses: [...state.stopLosses, loss],
    }))
  },

  removeStopLoss: (id: string) => {
    set((state) => ({
      stopLosses: state.stopLosses.filter((l) => l.id !== id),
    }))
  },

  updateStopLoss: (id: string, data: Partial<StopLoss>) => {
    set((state) => ({
      stopLosses: state.stopLosses.map((l) =>
        l.id === id ? { ...l, ...data } : l
      ),
    }))
  },

  setRiskAlert: (data: Partial<RiskAlert>) => {
    set((state) => ({
      riskAlert: { ...state.riskAlert, ...data },
    }))
  },

  fetchPlan: async (date: string) => {
    set({ planLoading: true })
    try {
      const response = await diaryService.getTomorrowPlan(date)
      const detail = response.data.data
      if (detail && detail.plan) {
        // 从日记详情中提取计划数据
        const plan: TomorrowPlan = {
          date: date,
          watchStocks: detail.plan.watchStocks || [],
          buyPlans: detail.plan.buyPlans || [],
          sellPlans: detail.plan.sellPlans || [],
          stopLosses: detail.plan.stopLosses || [],
          riskAlert: { ...initialRiskAlert }, // 后端暂无 riskAlert 字段
        }
        // 同时更新 currentDiaryId
        if (detail.summary?.id) {
          set({ currentDiaryId: detail.summary.id as unknown as string })
        }
        set({
          currentPlan: plan,
          watchStocks: plan.watchStocks,
          buyPlans: plan.buyPlans,
          sellPlans: plan.sellPlans,
          stopLosses: plan.stopLosses,
          riskAlert: plan.riskAlert,
        })
      } else {
        // 数据为空，静默重置表单，不显示错误
        get().resetPlanForm()
        set({ currentPlan: null })
      }
    } catch (error: unknown) {
      // 404 或其他错误时静默处理，不显示错误提示
      console.error('Failed to fetch plan:', error)
      get().resetPlanForm()
      set({ currentPlan: null })
    } finally {
      set({ planLoading: false })
    }
  },

  savePlan: async () => {
    const state = get()
    set({ planSaving: true })
    try {
      // 如果没有 diaryId，需要先创建日记
      let diaryId = state.currentDiaryId
      if (!diaryId) {
        // 先创建一个空日记
        const createResponse = await diaryService.saveTodaySummary({
          date: state.selectedDate,
        })
        diaryId = createResponse.data.data?.id as string
        if (!diaryId) {
          throw new Error('Failed to create diary')
        }
        set({ currentDiaryId: diaryId })
      }

      await diaryService.saveTomorrowPlan({
        date: state.selectedDate,
        diaryId: diaryId,
        watchStocks: state.watchStocks,
        buyPlans: state.buyPlans,
        sellPlans: state.sellPlans,
        stopLosses: state.stopLosses,
        riskAlert: state.riskAlert,
      })
      message.success('保存成功')
      return true
    } catch (error) {
      console.error('Failed to save plan:', error)
      message.error('保存失败')
      return false
    } finally {
      set({ planSaving: false })
    }
  },

  resetPlanForm: () => {
    set({
      watchStocks: [],
      buyPlans: [],
      sellPlans: [],
      stopLosses: [],
      riskAlert: { ...initialRiskAlert },
    })
  },
}))
