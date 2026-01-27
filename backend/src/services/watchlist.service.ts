import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface WatchlistInput {
  stockCode: string
  stockName: string
  industry?: string
  addPrice?: number
  targetPrice?: number
  stopPrice?: number
  notes?: string
}

export const watchlistService = {
  async getWatchlist(userId: string) {
    return prisma.watchlist.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    })
  },

  async addStock(userId: string, data: WatchlistInput) {
    return prisma.watchlist.create({
      data: {
        userId,
        stockCode: data.stockCode,
        stockName: data.stockName,
        industry: data.industry,
        addPrice: data.addPrice,
        targetPrice: data.targetPrice,
        stopPrice: data.stopPrice,
        notes: data.notes,
      },
    })
  },

  async updateStock(userId: string, id: string, data: Partial<WatchlistInput>) {
    return prisma.watchlist.update({
      where: { id, userId },
      data,
    })
  },

  async removeStock(userId: string, id: string) {
    return prisma.watchlist.delete({
      where: { id, userId },
    })
  },

  async reorderStocks(userId: string, stockIds: string[]) {
    const updates = stockIds.map((id, index) =>
      prisma.watchlist.update({
        where: { id, userId },
        data: { sortOrder: index },
      })
    )
    return prisma.$transaction(updates)
  },
}
