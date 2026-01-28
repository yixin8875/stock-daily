import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface GoalInput {
  title: string
  targetValue: number
  currentValue?: number
  deadline?: string | Date
  category: string
}

export const goalService = {
  async getGoals(userId: string) {
    return prisma.investmentGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createGoal(userId: string, data: GoalInput) {
    return prisma.investmentGoal.create({
      data: { userId, ...data },
    })
  },

  async updateGoal(userId: string, id: string, data: Partial<GoalInput & { isCompleted: boolean }>) {
    return prisma.investmentGoal.update({
      where: { id, userId },
      data,
    })
  },

  async deleteGoal(userId: string, id: string) {
    return prisma.investmentGoal.delete({
      where: { id, userId },
    })
  },
}
