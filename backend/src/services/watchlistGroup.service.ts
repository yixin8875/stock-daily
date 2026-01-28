import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WatchlistGroupInput {
  name: string;
  color?: string;
  sortOrder?: number;
}

export const watchlistGroupService = {
  async getGroups(userId: string) {
    return prisma.watchlistGroup.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { watchlists: true } } },
    });
  },

  async createGroup(userId: string, data: WatchlistGroupInput) {
    return prisma.watchlistGroup.create({
      data: { userId, ...data },
    });
  },

  async updateGroup(userId: string, id: string, data: Partial<WatchlistGroupInput>) {
    return prisma.watchlistGroup.update({
      where: { id, userId },
      data,
    });
  },

  async deleteGroup(userId: string, id: string) {
    await prisma.watchlist.updateMany({
      where: { userId, groupId: id },
      data: { groupId: null },
    });
    return prisma.watchlistGroup.delete({
      where: { id, userId },
    });
  },

  async moveStock(userId: string, stockCode: string, groupId: string | null) {
    return prisma.watchlist.update({
      where: { userId_stockCode: { userId, stockCode } },
      data: { groupId },
    });
  },

  async getStocksByGroup(userId: string, groupId: string | null) {
    return prisma.watchlist.findMany({
      where: { userId, groupId },
      orderBy: { sortOrder: 'asc' },
    });
  },
};
