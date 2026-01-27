import request from '@/utils/request'
import type { DailyReview, DeviationTrend } from '@/types/review'

export const reviewService = {
  // 获取单日复盘对比
  getDailyReview: (date?: string) => {
    return request.get<DailyReview>('/review/daily', { params: { date } })
  },

  // 获取执行偏差趋势
  getDeviationTrend: (startDate?: string, endDate?: string, limit?: number) => {
    return request.get<DeviationTrend[]>('/review/trend', {
      params: { startDate, endDate, limit },
    })
  },

  // 获取有复盘数据的日期列表
  getReviewDates: (startDate?: string, endDate?: string) => {
    return request.get<string[]>('/review/dates', {
      params: { startDate, endDate },
    })
  },
}
