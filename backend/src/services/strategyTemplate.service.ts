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
      data: {
        userId,
        name: data.name,
        description: data.description,
        category: data.category,
        params: data.params as object,
        isPublic: data.isPublic,
      },
    });
  },

  async update(userId: string, id: string, data: Partial<StrategyTemplateInput>) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.params !== undefined) updateData.params = data.params as object;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    return prisma.strategyTemplate.update({
      where: { id, userId },
      data: updateData,
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
