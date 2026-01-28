import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TradeReviewTemplateInput {
  date: string | Date
  stockCode: string
  stockName: string
  tradeType: 'buy' | 'sell'
  entryReason?: string
  exitReason?: string
  marketCondition?: string
  emotionState?: number
  lessonsLearned?: string
  improvement?: string
  rating: number
}

export const tradeReviewTemplateService = {
  async getAll(userId: string) {
    return prisma.tradeReviewTemplate.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  },

  async create(userId: string, data: TradeReviewTemplateInput) {
    return prisma.tradeReviewTemplate.create({
      data: { userId, ...data },
    })
  },

  async update(userId: string, id: string, data: Partial<TradeReviewTemplateInput>) {
    return prisma.tradeReviewTemplate.update({
      where: { id, userId },
      data,
    })
  },

  async delete(userId: string, id: string) {
    return prisma.tradeReviewTemplate.delete({
      where: { id, userId },
    })
  },
}
