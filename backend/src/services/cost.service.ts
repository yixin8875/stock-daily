import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CostRecordInput {
  tradeType: string
  price: number
  quantity: number
}

export const costService = {
  async getRecords(userId: string) {
    return prisma.costRecord.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    })
  },

  async addRecord(userId: string, data: CostRecordInput) {
    const count = await prisma.costRecord.count({ where: { userId } })
    return prisma.costRecord.create({
      data: { userId, ...data, sortOrder: count },
    })
  },

  async deleteRecord(userId: string, id: string) {
    return prisma.costRecord.delete({
      where: { id, userId },
    })
  },

  async clearRecords(userId: string) {
    return prisma.costRecord.deleteMany({
      where: { userId },
    })
  },
}
