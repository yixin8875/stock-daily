import request from '@/utils/request'
import type { PeriodReport, ReportPeriod, ReportMeta } from '@/types/report'

export const reportService = {
  // 获取周报或月报
  getReport: (period: ReportPeriod, date?: string) => {
    return request.get<PeriodReport>(`/reports/${period}`, { params: { date } })
  },

  // 获取报告历史列表
  getReportList: (period: ReportPeriod, limit?: number) => {
    return request.get<ReportMeta[]>(`/reports/${period}/list`, { params: { limit } })
  },

  // 导出报告为 Excel
  exportReport: async (period: ReportPeriod, date?: string) => {
    const response = await request.get(`/reports/${period}/export`, {
      params: { date },
      responseType: 'blob',
    })
    return response
  },
}
