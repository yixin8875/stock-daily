import { PrismaClient, AlertType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface PositionInput {
  stockCode: string;
  stockName: string;
  quantity: number;
  costPrice: number;
  targetPrice?: number;
  stopPrice?: number;
  notes?: string;
}

export interface PositionWithQuote {
  id: string;
  stockCode: string;
  stockName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
  targetPrice: number | null;
  stopPrice: number | null;
  notes: string | null;
  currentPrice?: number;
  marketValue?: number;
  profit?: number;
  profitRate?: number;
}

export class PositionService {
  /**
   * 获取用户所有持仓
   */
  static async getPositions(userId: string): Promise<PositionWithQuote[]> {
    const positions = await prisma.position.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return positions.map(p => ({
      id: p.id,
      stockCode: p.stockCode,
      stockName: p.stockName,
      quantity: p.quantity,
      costPrice: Number(p.costPrice),
      totalCost: Number(p.totalCost),
      targetPrice: p.targetPrice ? Number(p.targetPrice) : null,
      stopPrice: p.stopPrice ? Number(p.stopPrice) : null,
      notes: p.notes,
    }));
  }

  /**
   * 添加持仓
   */
  static async addPosition(userId: string, input: PositionInput) {
    const totalCost = input.quantity * input.costPrice;

    // 检查是否已有该股票持仓
    const existing = await prisma.position.findUnique({
      where: { userId_stockCode: { userId, stockCode: input.stockCode } },
    });

    if (existing) {
      // 合并持仓（加仓）
      const newQuantity = existing.quantity + input.quantity;
      const newTotalCost = Number(existing.totalCost) + totalCost;
      const newCostPrice = newTotalCost / newQuantity;

      return prisma.position.update({
        where: { id: existing.id },
        data: {
          quantity: newQuantity,
          costPrice: newCostPrice,
          totalCost: newTotalCost,
          targetPrice: input.targetPrice,
          stopPrice: input.stopPrice,
          notes: input.notes || existing.notes,
        },
      });
    }

    return prisma.position.create({
      data: {
        userId,
        stockCode: input.stockCode,
        stockName: input.stockName,
        quantity: input.quantity,
        costPrice: input.costPrice,
        totalCost,
        targetPrice: input.targetPrice,
        stopPrice: input.stopPrice,
        notes: input.notes,
      },
    });
  }

  /**
   * 更新持仓
   */
  static async updatePosition(
    userId: string,
    positionId: string,
    input: Partial<PositionInput>
  ) {
    const position = await prisma.position.findFirst({
      where: { id: positionId, userId },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    const updateData: any = {};
    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity;
      updateData.totalCost = input.quantity * (input.costPrice || Number(position.costPrice));
    }
    if (input.costPrice !== undefined) {
      updateData.costPrice = input.costPrice;
      updateData.totalCost = (input.quantity || position.quantity) * input.costPrice;
    }
    if (input.targetPrice !== undefined) updateData.targetPrice = input.targetPrice;
    if (input.stopPrice !== undefined) updateData.stopPrice = input.stopPrice;
    if (input.notes !== undefined) updateData.notes = input.notes;

    return prisma.position.update({
      where: { id: positionId },
      data: updateData,
    });
  }

  /**
   * 减仓
   */
  static async reducePosition(
    userId: string,
    positionId: string,
    quantity: number
  ) {
    const position = await prisma.position.findFirst({
      where: { id: positionId, userId },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (quantity > position.quantity) {
      throw new Error('Reduce quantity exceeds position quantity');
    }

    if (quantity === position.quantity) {
      // 清仓
      await prisma.position.delete({ where: { id: positionId } });
      return null;
    }

    // 部分减仓
    const newQuantity = position.quantity - quantity;
    const newTotalCost = newQuantity * Number(position.costPrice);

    return prisma.position.update({
      where: { id: positionId },
      data: {
        quantity: newQuantity,
        totalCost: newTotalCost,
      },
    });
  }

  /**
   * 删除持仓
   */
  static async deletePosition(userId: string, positionId: string) {
    const position = await prisma.position.findFirst({
      where: { id: positionId, userId },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    return prisma.position.delete({ where: { id: positionId } });
  }

  /**
   * 获取持仓汇总
   */
  static async getPositionSummary(userId: string) {
    const positions = await prisma.position.findMany({
      where: { userId },
    });

    const totalCost = positions.reduce((sum, p) => sum + Number(p.totalCost), 0);
    const stockCount = positions.length;

    return {
      stockCount,
      totalCost,
      positions: positions.map(p => ({
        stockCode: p.stockCode,
        stockName: p.stockName,
        quantity: p.quantity,
        costPrice: Number(p.costPrice),
        totalCost: Number(p.totalCost),
      })),
    };
  }
}