import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TradePlanTemplateInput {
  stockCode: string
  stockName: string
  direction: 'buy' | 'sell'
  entryPrice: number
  targetPrice: number
  stopPrice: number
  positionSize?: number
  reason?: string
}

export const tradePlanTemplateService = {
  async getAll(userId: string) {
    return prisma.tradePlanTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async create(userId: string, data: TradePlanTemplateInput) {
    return prisma.tradePlanTemplate.create({
      data: { userId, ...data },
    })
  },

  async update(userId: string, id: string, data: Partial<TradePlanTemplateInput & { status: string }>) {
    return prisma.tradePlanTemplate.update({
      where: { id, userId },
      data,
    })
  },

  async delete(userId: string, id: string) {
    return prisma.tradePlanTemplate.delete({
      where: { id, userId },
    })
  },
}
