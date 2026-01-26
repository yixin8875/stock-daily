import { prisma } from '../app';
import { ApiError } from '../middlewares';
import { TradeDirection } from '@prisma/client';

export interface CreateTradeInput {
  diaryId: string;
  stockCode: string;
  stockName: string;
  direction: TradeDirection;
  price: number;
  quantity: number;
  amount: number;
  reason?: string;
  strategyTag?: string;
}

export interface TradeFilter {
  diaryId?: string;
  stockCode?: string;
  startDate?: Date;
  endDate?: Date;
}

export class TradeService {
  static async create(userId: string, input: CreateTradeInput) {
    // Verify diary belongs to user
    const diary = await prisma.diary.findFirst({
      where: { id: input.diaryId, userId },
    });

    if (!diary) {
      throw new ApiError(404, 'Diary not found');
    }

    const trade = await prisma.trade.create({
      data: {
        diary: { connect: { id: input.diaryId } },
        stockCode: input.stockCode,
        stockName: input.stockName,
        direction: input.direction,
        price: input.price,
        quantity: input.quantity,
        amount: input.amount,
        reason: input.reason,
        strategyTag: input.strategyTag,
      },
    });

    return trade;
  }

  static async findAll(userId: string, filter: TradeFilter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Build where clause with user verification through diary
    const whereClause: any = {
      diary: { userId },
    };

    if (filter.diaryId) {
      whereClause.diaryId = filter.diaryId;
    }

    if (filter.stockCode) {
      whereClause.stockCode = filter.stockCode;
    }

    if (filter.startDate || filter.endDate) {
      whereClause.diary = {
        ...whereClause.diary,
        date: {},
      };
      if (filter.startDate) {
        whereClause.diary.date.gte = filter.startDate;
      }
      if (filter.endDate) {
        whereClause.diary.date.lte = filter.endDate;
      }
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          diary: {
            select: {
              id: true,
              date: true,
            },
          },
        },
      }),
      prisma.trade.count({ where: whereClause }),
    ]);

    return {
      data: trades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(userId: string, id: string) {
    const trade = await prisma.trade.findFirst({
      where: {
        id,
        diary: { userId },
      },
      include: {
        diary: {
          select: {
            id: true,
            date: true,
          },
        },
      },
    });

    if (!trade) {
      throw new ApiError(404, 'Trade not found');
    }

    return trade;
  }

  static async update(userId: string, id: string, input: Partial<CreateTradeInput>) {
    // Verify trade exists and belongs to user
    const trade = await prisma.trade.findFirst({
      where: {
        id,
        diary: { userId },
      },
    });

    if (!trade) {
      throw new ApiError(404, 'Trade not found');
    }

    // Remove diaryId from update data if present (cannot change diary)
    const { diaryId, ...updateData } = input;

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: updateData as any,
    });

    return updatedTrade;
  }

  static async delete(userId: string, id: string) {
    // Verify trade exists and belongs to user
    const trade = await prisma.trade.findFirst({
      where: {
        id,
        diary: { userId },
      },
    });

    if (!trade) {
      throw new ApiError(404, 'Trade not found');
    }

    await prisma.trade.delete({
      where: { id },
    });

    return { message: 'Trade deleted successfully' };
  }
}