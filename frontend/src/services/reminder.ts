import request from '@/utils/request'

export interface BuyPlanReminder {
  id: string
  stockCode: string
  stockName: string
  targetPrice: number
  positionPercent: number
  buyReason: string | null
  triggerCondition: string | null
}

export interface SellPlanReminder {
  id: string
  stockCode: string
  stockName: string
  targetPrice: number
  sellPercent: number
  sellReason: string | null
  triggerCondition: string | null
}

export interface StopLossReminder {
  id: string
  stockCode: string
  stockName: string
  stopPrice: number
  costPrice: number | null
  stopReason: string | null
}

export interface WatchStockReminder {
  id: string
  stockCode: string
  stockName: string
  watchReason: string | null
  watchLevel: string
  techPosition: string | null
}

export interface TodayReminder {
  buyPlans: BuyPlanReminder[]
  sellPlans: SellPlanReminder[]
  stopLosses: StopLossReminder[]
  watchStocks: WatchStockReminder[]
  summary: {
    totalBuyPlans: number
    totalSellPlans: number
    totalStopLosses: number
    totalWatchStocks: number
  }
}

export interface PendingPlans {
  buyPlans: Array<{ date: string; plans: BuyPlanReminder[] }>
  sellPlans: Array<{ date: string; plans: SellPlanReminder[] }>
  stopLosses: Array<{ date: string; plans: StopLossReminder[] }>
}

export const reminderService = {
  // 获取今日提醒
  getTodayReminders: () => {
    return request.get<TodayReminder>('/reminders/today')
  },

  // 获取待执行计划
  getPendingPlans: () => {
    return request.get<PendingPlans>('/reminders/pending')
  },
}
