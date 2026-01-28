import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  eventType: string
  description?: string
  stockCode?: string
  stockName?: string
  createdAt: string
}

export interface CalendarEventInput {
  date: string
  title: string
  eventType: string
  description?: string
  stockCode?: string
  stockName?: string
}

export const calendarEventService = {
  getAll: (startDate?: string, endDate?: string) =>
    request.get<ApiResponse<CalendarEvent[]>>('/calendar-events', {
      params: { startDate, endDate },
    }),
  create: (data: CalendarEventInput) =>
    request.post<ApiResponse<CalendarEvent>>('/calendar-events', data),
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/calendar-events/${id}`),
}
