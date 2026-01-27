import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { TodaySummary, SaveTomorrowPlanParams, CalendarMonthData, DiaryDetail, DiaryBackendResponse, SaveDiaryBackendParams } from '@/types/diary'

export const diaryService = {
  // 获取指定日期的今日总结
  getTodaySummary: (date: string) => {
    return request.get<ApiResponse<DiaryBackendResponse | null>>(`/diaries/${date}`)
  },

  // 保存今日总结（创建或更新）
  saveTodaySummary: (params: SaveDiaryBackendParams) => {
    if (params.id) {
      return request.put<ApiResponse<DiaryBackendResponse>>(`/diaries/${params.id}`, params)
    }
    return request.post<ApiResponse<DiaryBackendResponse>>('/diaries', params)
  },

  // 获取日记列表
  getDiaryList: (params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }) => {
    // 后端使用 limit 而不是 pageSize
    const queryParams = params ? {
      page: params.page,
      limit: params.pageSize,
      startDate: params.startDate,
      endDate: params.endDate,
    } : undefined
    return request.get<ApiResponse<{ data: TodaySummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>>('/diaries', { params: queryParams })
  },

  // 删除日记
  deleteDiary: (id: number | string) => {
    return request.delete<ApiResponse<null>>(`/diaries/${id}`)
  },

  // 获取指定日期的明日计划（通过获取日记详情）
  getTomorrowPlan: (date: string) => {
    return request.get<ApiResponse<DiaryDetail>>(`/diaries/detail/${date}`)
  },

  // 保存明日计划（需要先获取或创建日记，然后保存各个计划项）
  saveTomorrowPlan: async (params: SaveTomorrowPlanParams & { diaryId?: string }) => {
    // 明日计划通过 /plans 路由保存，需要 diaryId
    if (!params.diaryId) {
      throw new Error('diaryId is required for saving tomorrow plan')
    }

    const results = await Promise.all([
      // 保存关注股票
      ...(params.watchStocks || []).map(stock =>
        stock.id && !stock.id.startsWith('temp_')
          ? request.put(`/plans/watch/${stock.id}`, { ...stock, diaryId: params.diaryId })
          : request.post('/plans/watch', { ...stock, diaryId: params.diaryId })
      ),
      // 保存买入计划
      ...(params.buyPlans || []).map(plan =>
        plan.id && !plan.id.startsWith('temp_')
          ? request.put(`/plans/buy/${plan.id}`, { ...plan, diaryId: params.diaryId })
          : request.post('/plans/buy', { ...plan, diaryId: params.diaryId })
      ),
      // 保存卖出计划
      ...(params.sellPlans || []).map(plan =>
        plan.id && !plan.id.startsWith('temp_')
          ? request.put(`/plans/sell/${plan.id}`, { ...plan, diaryId: params.diaryId })
          : request.post('/plans/sell', { ...plan, diaryId: params.diaryId })
      ),
      // 保存止损设置
      ...(params.stopLosses || []).map(loss =>
        loss.id && !loss.id.startsWith('temp_')
          ? request.put(`/plans/stoploss/${loss.id}`, { ...loss, diaryId: params.diaryId })
          : request.post('/plans/stoploss', { ...loss, diaryId: params.diaryId })
      ),
    ])

    return { data: { success: true, data: results } }
  },

  // 删除计划项
  deleteWatchStock: (id: string) => request.delete(`/plans/watch/${id}`),
  deleteBuyPlan: (id: string) => request.delete(`/plans/buy/${id}`),
  deleteSellPlan: (id: string) => request.delete(`/plans/sell/${id}`),
  deleteStopLoss: (id: string) => request.delete(`/plans/stoploss/${id}`),

  // 获取日历月度数据
  getCalendarData: (year: number, month: number) => {
    return request.get<ApiResponse<CalendarMonthData>>('/diaries/calendar', { params: { year, month } })
  },

  // 获取指定日期的完整日记（包含今日总结和明日计划）
  getDiaryDetail: (date: string) => {
    return request.get<ApiResponse<DiaryDetail>>(`/diaries/detail/${date}`)
  },
}
