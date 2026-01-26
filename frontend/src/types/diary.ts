// 大盘走势枚举
export type MarketTrend = 'big_rise' | 'small_rise' | 'flat' | 'small_fall' | 'big_fall'

// 成交量枚举
export type VolumeType = 'high' | 'low' | 'normal'

// 交易方向枚举
export type TradeDirection = 'buy' | 'sell'

// 情绪等级枚举
export type EmotionLevel = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative'

// 热点板块选项
export const HOT_SECTORS = [
  '科技', '新能源', '医药', '消费', '金融', '地产', '军工', '半导体',
  '人工智能', '汽车', '有色', '化工', '农业', '传媒', '通信', '电力'
] as const

// 反思标签选项
export const REFLECTION_TAGS = [
  '追涨杀跌', '止损不及时', '仓位过重', '频繁交易', '情绪化操作',
  '严格止损', '合理仓位', '耐心持有', '理性分析', '执行纪律'
] as const

// 知识分类选项
export const KNOWLEDGE_CATEGORIES = [
  '技术分析', '基本面分析', '行业研究', '宏观经济', '交易心理',
  '风险管理', '资金管理', '选股策略', '买卖时机', '其他'
] as const

// 交易记录
export interface TradeRecord {
  id: string
  stockCode: string
  stockName: string
  direction: TradeDirection
  price: number
  quantity: number
  reason: string
  strategyTagId?: number | null  // 策略标签ID
}

// 大盘点评
export interface MarketComment {
  trend: MarketTrend | null
  volume: VolumeType | null
  hotSectors: string[]
  comment: string
}

// 盈亏情况
export interface ProfitLoss {
  todayProfit: number | null
  todayProfitRate: number | null
  totalAssets: number | null
}

// 操作反思
export interface OperationReflection {
  didRight: string
  didWrong: string
  improvementPlan: string
  tags: string[]
}

// 情绪记录
export interface EmotionRecord {
  beforeOpen: EmotionLevel | null
  duringTrading: EmotionLevel | null
  afterClose: EmotionLevel | null
  note: string
}

// 学习笔记
export interface LearningNote {
  content: string
  category: string
}

// 今日总结完整数据
export interface TodaySummary {
  id?: number
  date: string
  marketComment: MarketComment
  tradeRecords: TradeRecord[]
  profitLoss: ProfitLoss
  reflection: OperationReflection
  emotion: EmotionRecord
  learningNote: LearningNote
  createdAt?: string
  updatedAt?: string
}

// 创建/更新今日总结参数
export interface SaveTodaySummaryParams {
  date: string
  marketComment: MarketComment
  tradeRecords: TradeRecord[]
  profitLoss: ProfitLoss
  reflection: OperationReflection
  emotion: EmotionRecord
  learningNote: LearningNote
}

// ==================== 明日计划相关类型 ====================

// 关注级别枚举
export type WatchLevel = 'high' | 'medium' | 'low'

// 风险类型枚举
export type RiskType = 'system' | 'stock' | 'position' | 'emotion'

// 风险类型选项
export const RISK_TYPES = [
  { label: '系统风险', value: 'system' },
  { label: '个股风险', value: 'stock' },
  { label: '仓位风险', value: 'position' },
  { label: '情绪风险', value: 'emotion' },
] as const

// 关注级别选项
export const WATCH_LEVELS = [
  { label: '重点关注', value: 'high' },
  { label: '一般关注', value: 'medium' },
  { label: '观察', value: 'low' },
] as const

// 关注股票
export interface WatchStock {
  id: string
  stockCode: string
  stockName: string
  reason: string
  level: WatchLevel
  technicalPosition?: string
}

// 买入计划
export interface BuyPlan {
  id: string
  stockCode: string
  stockName: string
  targetPrice: number | null
  positionPercent: number | null
  reason: string
  triggerCondition: string
}

// 卖出计划
export interface SellPlan {
  id: string
  stockCode: string
  stockName: string
  targetPrice: number | null
  sellPercent: number | null
  reason: string
  triggerCondition: string
}

// 止损设置
export interface StopLoss {
  id: string
  stockCode: string
  stockName: string
  stopPrice: number | null
  costPrice?: number | null
  reason: string
}

// 风险提示
export interface RiskAlert {
  riskTypes: RiskType[]
  description: string
  countermeasures: string
}

// 明日计划完整数据
export interface TomorrowPlan {
  id?: number
  date: string
  watchStocks: WatchStock[]
  buyPlans: BuyPlan[]
  sellPlans: SellPlan[]
  stopLosses: StopLoss[]
  riskAlert: RiskAlert
  createdAt?: string
  updatedAt?: string
}

// 保存明日计划参数
export interface SaveTomorrowPlanParams {
  date: string
  watchStocks: WatchStock[]
  buyPlans: BuyPlan[]
  sellPlans: SellPlan[]
  stopLosses: StopLoss[]
  riskAlert: RiskAlert
}

// ==================== 历史回顾相关类型 ====================

// 日历单日数据
export interface CalendarDayData {
  date: string
  hasRecord: boolean
  todayProfit: number | null
  todayProfitRate: number | null
  tradeCount: number
}

// 日历月度数据响应
export interface CalendarMonthData {
  [date: string]: CalendarDayData
}

// 日记详情（包含今日总结和明日计划）
export interface DiaryDetail {
  summary: TodaySummary | null
  plan: {
    watchStocks: WatchStock[]
    buyPlans: BuyPlan[]
    sellPlans: SellPlan[]
    stopLosses: StopLoss[]
  } | null
}

