import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StrategyParams {
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  indicators?: string[];
  conditions?: Record<string, any>;
}

export interface StrategyTemplateInput {
  name: string;
  description?: string;
  category: string;
  params: StrategyParams;
  isPublic?: boolean;
}

export const strategyTemplateService = {
  async getTemplates(userId: string) {
    return prisma.strategyTemplate.findMany({
      where: { OR: [{ userId }, { userId: null }, { isPublic: true }] },
      orderBy: { usageCount: 'desc' },
    });
  },

  async getByCategory(userId: string, category: string) {
    return prisma.strategyTemplate.findMany({
      where: {
        category,
        OR: [{ userId }, { userId: null }, { isPublic: true }],
      },
    });
  },

  async create(userId: string, data: StrategyTemplateInput) {
    return prisma.strategyTemplate.create({
      data: { userId, ...data },
    });
  },

  async update(userId: string, id: string, data: Partial<StrategyTemplateInput>) {
    return prisma.strategyTemplate.update({
      where: { id, userId },
      data,
    });
  },

  async delete(userId: string, id: string) {
    return prisma.strategyTemplate.delete({
      where: { id, userId },
    });
  },

  async incrementUsage(id: string) {
    return prisma.strategyTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  },
};
