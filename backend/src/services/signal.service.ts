import { PrismaClient, SignalType, SignalDirection } from '@prisma/client'

const prisma = new PrismaClient()

export interface SignalInput {
  stockCode: string
  stockName: string
  signalType: SignalType
  indicator: string
  direction: SignalDirection
  price: number
  description?: string
}

export const signalService = {
  async getSignals(userId: string, unreadOnly = false) {
    const where: any = { userId }
    if (unreadOnly) where.isRead = false
    return prisma.tradeSignal.findMany({
      where,
      orderBy: { triggeredAt: 'desc' },
      take: 100,
    })
  },

  async createSignal(userId: string, data: SignalInput) {
    return prisma.tradeSignal.create({
      data: {
        userId,
        stockCode: data.stockCode,
        stockName: data.stockName,
        signalType: data.signalType,
        indicator: data.indicator,
        direction: data.direction,
        price: data.price,
        description: data.description,
      },
    })
  },

  async markAsRead(userId: string, id: string) {
    return prisma.tradeSignal.update({
      where: { id, userId },
      data: { isRead: true },
    })
  },

  async markAllAsRead(userId: string) {
    return prisma.tradeSignal.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  },

  async deleteSignal(userId: string, id: string) {
    return prisma.tradeSignal.delete({
      where: { id, userId },
    })
  },

  async clearOldSignals(userId: string, days = 30) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return prisma.tradeSignal.deleteMany({
      where: {
        userId,
        triggeredAt: { lt: cutoff },
        isRead: true,
      },
    })
  },
}
