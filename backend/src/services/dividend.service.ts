import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DividendInput {
  stockCode: string
  stockName: string
  exDate: string | Date
  dividendType: string
  amount: number
  shares?: number
  totalAmount?: number
  notes?: string
}

export const dividendService = {
  async getDividends(userId: string) {
    return prisma.dividendRecord.findMany({
      where: { userId },
      orderBy: { exDate: 'desc' },
    })
  },

  async createDividend(userId: string, data: DividendInput) {
    return prisma.dividendRecord.create({
      data: { userId, ...data },
    })
  },

  async updateDividend(userId: string, id: string, data: Partial<DividendInput>) {
    return prisma.dividendRecord.update({
      where: { id, userId },
      data,
    })
  },

  async deleteDividend(userId: string, id: string) {
    return prisma.dividendRecord.delete({
      where: { id, userId },
    })
  },
}
