import request from '@/utils/request'

export interface ExportParams {
  startDate?: string
  endDate?: string
}

export const exportService = {
  /**
   * 导出日记为JSON格式
   */
  exportJson: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params: ExportParams = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await request.get('/api/export/json', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * 导出日记为CSV格式
   */
  exportCsv: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params: ExportParams = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await request.get('/api/export/csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
