import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface JournalInput {
  date: string
  marketObservation: string
  tradingThoughts: string
  lessonsLearned: string
  emotionScore: number
  tags?: string[]
}

export const journalService = {
  async getJournals(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.tradingJournal.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tradingJournal.count({ where: { userId } }),
    ])
    return { data, total }
  },

  async getJournalByDate(userId: string, date: string) {
    return prisma.tradingJournal.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    })
  },

  async createJournal(userId: string, data: JournalInput) {
    return prisma.tradingJournal.create({
      data: {
        userId,
        date: new Date(data.date),
        marketObservation: data.marketObservation,
        tradingThoughts: data.tradingThoughts,
        lessonsLearned: data.lessonsLearned,
        emotionScore: data.emotionScore,
        tags: data.tags || [],
      },
    })
  },

  async updateJournal(userId: string, id: string, data: Partial<JournalInput>) {
    const updateData: Record<string, unknown> = { ...data }
    if (data.date) {
      updateData.date = new Date(data.date)
    }
    return prisma.tradingJournal.update({
      where: { id, userId },
      data: updateData,
    })
  },

  async deleteJournal(userId: string, id: string) {
    return prisma.tradingJournal.delete({
      where: { id, userId },
    })
  },
}
