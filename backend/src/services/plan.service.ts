import { prisma } from '../app';
import { ApiError } from '../middlewares';
import { WatchLevel } from '@prisma/client';

// Watch Stock interfaces
export interface CreateWatchStockInput {
  diaryId: string;
  stockCode: string;
  stockName: string;
  watchReason?: string;
  watchLevel?: WatchLevel;
  techPosition?: string;
}

// Buy Plan interfaces
export interface CreateBuyPlanInput {
  diaryId: string;
  stockCode: string;
  stockName: string;
  targetPrice: number;
  positionPercent: number;
  buyReason?: string;
  triggerCondition?: string;
}

// Sell Plan interfaces
export interface CreateSellPlanInput {
  diaryId: string;
  stockCode: string;
  stockName: string;
  targetPrice: number;
  sellPercent: number;
  sellReason?: string;
  triggerCondition?: string;
}

// Stop Loss interfaces
export interface CreateStopLossInput {
  diaryId: string;
  stockCode: string;
  stockName: string;
  stopPrice: number;
  costPrice?: number;
  stopReason?: string;
}

// Helper function to verify diary ownership
async function verifyDiaryOwnership(diaryId: string, userId: string) {
  const diary = await prisma.diary.findFirst({
    where: { id: diaryId, userId },
  });

  if (!diary) {
    throw new ApiError(404, 'Diary not found');
  }

  return diary;
}

// ==================== Watch Stock Service ====================
export class WatchStockService {
  static async create(userId: string, input: CreateWatchStockInput) {
    await verifyDiaryOwnership(input.diaryId, userId);

    const watchStock = await prisma.watchStock.create({
      data: {
        diary: { connect: { id: input.diaryId } },
        stockCode: input.stockCode,
        stockName: input.stockName,
        watchReason: input.watchReason,
        watchLevel: input.watchLevel || 'NORMAL',
        techPosition: input.techPosition,
      },
    });

    return watchStock;
  }

  static async findByDiaryId(userId: string, diaryId: string) {
    await verifyDiaryOwnership(diaryId, userId);

    const watchStocks = await prisma.watchStock.findMany({
      where: { diaryId },
      orderBy: { createdAt: 'desc' },
    });

    return watchStocks;
  }

  static async update(userId: string, id: string, input: Partial<CreateWatchStockInput>) {
    const watchStock = await prisma.watchStock.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!watchStock || watchStock.diary.userId !== userId) {
      throw new ApiError(404, 'Watch stock not found');
    }

    const { diaryId, ...updateData } = input;

    const updated = await prisma.watchStock.update({
      where: { id },
      data: updateData as any,
    });

    return updated;
  }

  static async delete(userId: string, id: string) {
    const watchStock = await prisma.watchStock.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!watchStock || watchStock.diary.userId !== userId) {
      throw new ApiError(404, 'Watch stock not found');
    }

    await prisma.watchStock.delete({ where: { id } });

    return { message: 'Watch stock deleted successfully' };
  }
}

// ==================== Buy Plan Service ====================
export class BuyPlanService {
  static async create(userId: string, input: CreateBuyPlanInput) {
    await verifyDiaryOwnership(input.diaryId, userId);

    const buyPlan = await prisma.buyPlan.create({
      data: {
        diary: { connect: { id: input.diaryId } },
        stockCode: input.stockCode,
        stockName: input.stockName,
        targetPrice: input.targetPrice,
        positionPercent: input.positionPercent,
        buyReason: input.buyReason,
        triggerCondition: input.triggerCondition,
      },
    });

    return buyPlan;
  }

  static async findByDiaryId(userId: string, diaryId: string) {
    await verifyDiaryOwnership(diaryId, userId);

    const buyPlans = await prisma.buyPlan.findMany({
      where: { diaryId },
      orderBy: { createdAt: 'desc' },
    });

    return buyPlans;
  }

  static async update(userId: string, id: string, input: Partial<CreateBuyPlanInput>) {
    const buyPlan = await prisma.buyPlan.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!buyPlan || buyPlan.diary.userId !== userId) {
      throw new ApiError(404, 'Buy plan not found');
    }

    const { diaryId, ...updateData } = input;

    const updated = await prisma.buyPlan.update({
      where: { id },
      data: updateData as any,
    });

    return updated;
  }

  static async delete(userId: string, id: string) {
    const buyPlan = await prisma.buyPlan.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!buyPlan || buyPlan.diary.userId !== userId) {
      throw new ApiError(404, 'Buy plan not found');
    }

    await prisma.buyPlan.delete({ where: { id } });

    return { message: 'Buy plan deleted successfully' };
  }
}

// ==================== Sell Plan Service ====================
export class SellPlanService {
  static async create(userId: string, input: CreateSellPlanInput) {
    await verifyDiaryOwnership(input.diaryId, userId);

    const sellPlan = await prisma.sellPlan.create({
      data: {
        diary: { connect: { id: input.diaryId } },
        stockCode: input.stockCode,
        stockName: input.stockName,
        targetPrice: input.targetPrice,
        sellPercent: input.sellPercent,
        sellReason: input.sellReason,
        triggerCondition: input.triggerCondition,
      },
    });

    return sellPlan;
  }

  static async findByDiaryId(userId: string, diaryId: string) {
    await verifyDiaryOwnership(diaryId, userId);

    const sellPlans = await prisma.sellPlan.findMany({
      where: { diaryId },
      orderBy: { createdAt: 'desc' },
    });

    return sellPlans;
  }

  static async update(userId: string, id: string, input: Partial<CreateSellPlanInput>) {
    const sellPlan = await prisma.sellPlan.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!sellPlan || sellPlan.diary.userId !== userId) {
      throw new ApiError(404, 'Sell plan not found');
    }

    const { diaryId, ...updateData } = input;

    const updated = await prisma.sellPlan.update({
      where: { id },
      data: updateData as any,
    });

    return updated;
  }

  static async delete(userId: string, id: string) {
    const sellPlan = await prisma.sellPlan.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!sellPlan || sellPlan.diary.userId !== userId) {
      throw new ApiError(404, 'Sell plan not found');
    }

    await prisma.sellPlan.delete({ where: { id } });

    return { message: 'Sell plan deleted successfully' };
  }
}

// ==================== Stop Loss Service ====================
export class StopLossService {
  static async create(userId: string, input: CreateStopLossInput) {
    await verifyDiaryOwnership(input.diaryId, userId);

    const stopLoss = await prisma.stopLoss.create({
      data: {
        diary: { connect: { id: input.diaryId } },
        stockCode: input.stockCode,
        stockName: input.stockName,
        stopPrice: input.stopPrice,
        costPrice: input.costPrice,
        stopReason: input.stopReason,
      },
    });

    return stopLoss;
  }

  static async findByDiaryId(userId: string, diaryId: string) {
    await verifyDiaryOwnership(diaryId, userId);

    const stopLosses = await prisma.stopLoss.findMany({
      where: { diaryId },
      orderBy: { createdAt: 'desc' },
    });

    return stopLosses;
  }

  static async update(userId: string, id: string, input: Partial<CreateStopLossInput>) {
    const stopLoss = await prisma.stopLoss.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!stopLoss || stopLoss.diary.userId !== userId) {
      throw new ApiError(404, 'Stop loss not found');
    }

    const { diaryId, ...updateData } = input;

    const updated = await prisma.stopLoss.update({
      where: { id },
      data: updateData as any,
    });

    return updated;
  }

  static async delete(userId: string, id: string) {
    const stopLoss = await prisma.stopLoss.findFirst({
      where: { id },
      include: { diary: true },
    });

    if (!stopLoss || stopLoss.diary.userId !== userId) {
      throw new ApiError(404, 'Stop loss not found');
    }

    await prisma.stopLoss.delete({ where: { id } });

    return { message: 'Stop loss deleted successfully' };
  }
}
