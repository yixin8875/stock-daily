import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface EarningsInput {
  stockCode: string
  stockName: string
  reportDate: Date
  reportType: string
  notes?: string
}

export const earningsService = {
  async getEarnings(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId }
    if (startDate || endDate) {
      where.reportDate = {}
      if (startDate) where.reportDate.gte = startDate
      if (endDate) where.reportDate.lte = endDate
    }
    return prisma.earningsCalendar.findMany({
      where,
      orderBy: { reportDate: 'asc' },
    })
  },

  async getUpcoming(userId: string, days = 30) {
    const now = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    return prisma.earningsCalendar.findMany({
      where: {
        userId,
        reportDate: { gte: now, lte: endDate },
      },
      orderBy: { reportDate: 'asc' },
    })
  },

  async addEarnings(userId: string, data: EarningsInput) {
    return prisma.earningsCalendar.create({
      data: {
        userId,
        stockCode: data.stockCode,
        stockName: data.stockName,
        reportDate: data.reportDate,
        reportType: data.reportType,
        notes: data.notes,
      },
    })
  },

  async updateEarnings(userId: string, id: string, data: Partial<EarningsInput>) {
    return prisma.earningsCalendar.update({
      where: { id, userId },
      data,
    })
  },

  async deleteEarnings(userId: string, id: string) {
    return prisma.earningsCalendar.delete({
      where: { id, userId },
    })
  },

  async markNotified(userId: string, id: string) {
    return prisma.earningsCalendar.update({
      where: { id, userId },
      data: { isNotified: true },
    })
  },
}
