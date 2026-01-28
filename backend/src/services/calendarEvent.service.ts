import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CalendarEventInput {
  date: string | Date
  title: string
  eventType: string
  description?: string
  stockCode?: string
  stockName?: string
}

export const calendarEventService = {
  async getEvents(userId: string, startDate?: Date, endDate?: Date) {
    return prisma.calendarEvent.findMany({
      where: {
        userId,
        ...(startDate && endDate && {
          date: { gte: startDate, lte: endDate },
        }),
      },
      orderBy: { date: 'asc' },
    })
  },

  async createEvent(userId: string, data: CalendarEventInput) {
    return prisma.calendarEvent.create({
      data: { userId, ...data },
    })
  },

  async updateEvent(userId: string, id: string, data: Partial<CalendarEventInput>) {
    return prisma.calendarEvent.update({
      where: { id, userId },
      data,
    })
  },

  async deleteEvent(userId: string, id: string) {
    return prisma.calendarEvent.delete({
      where: { id, userId },
    })
  },
}
