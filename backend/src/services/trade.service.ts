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

  // 获取单只股票的交易历史
  static async getStockHistory(userId: string, stockCode: string) {
    const trades = await prisma.trade.findMany({
      where: {
        stockCode,
        diary: { userId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        diary: {
          select: {
            id: true,
            date: true,
          },
        },
      },
    });

    // 计算该股票的统计数据
    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    let totalBuyQuantity = 0;
    let totalSellQuantity = 0;
    let buyCount = 0;
    let sellCount = 0;

    trades.forEach((trade) => {
      const price = Number(trade.price);
      const amount = price * trade.quantity;
      if (trade.direction === 'BUY') {
        totalBuyAmount += amount;
        totalBuyQuantity += trade.quantity;
        buyCount++;
      } else {
        totalSellAmount += amount;
        totalSellQuantity += trade.quantity;
        sellCount++;
      }
    });

    const avgBuyPrice = totalBuyQuantity > 0 ? totalBuyAmount / totalBuyQuantity : 0;
    const avgSellPrice = totalSellQuantity > 0 ? totalSellAmount / totalSellQuantity : 0;
    const realizedProfit = totalSellAmount - (avgBuyPrice * totalSellQuantity);
    const holdingQuantity = totalBuyQuantity - totalSellQuantity;

    return {
      trades,
      statistics: {
        totalTrades: trades.length,
        buyCount,
        sellCount,
        totalBuyAmount,
        totalSellAmount,
        avgBuyPrice,
        avgSellPrice,
        realizedProfit,
        holdingQuantity,
        holdingCost: holdingQuantity > 0 ? avgBuyPrice * holdingQuantity : 0,
      },
    };
  }

  // 获取交易统计概览
  static async getTradeStatistics(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      diary: { userId },
    };

    if (startDate || endDate) {
      whereClause.diary = {
        ...whereClause.diary,
        date: {},
      };
      if (startDate) {
        whereClause.diary.date.gte = startDate;
      }
      if (endDate) {
        whereClause.diary.date.lte = endDate;
      }
    }

    const trades = await prisma.trade.findMany({
      where: whereClause,
      include: {
        diary: {
          select: {
            date: true,
          },
        },
      },
    });

    // 按股票分组统计
    const stockStats: Record<string, {
      stockCode: string;
      stockName: string;
      buyCount: number;
      sellCount: number;
      totalBuyAmount: number;
      totalSellAmount: number;
      totalBuyQuantity: number;
      totalSellQuantity: number;
    }> = {};

    trades.forEach((trade) => {
      if (!stockStats[trade.stockCode]) {
        stockStats[trade.stockCode] = {
          stockCode: trade.stockCode,
          stockName: trade.stockName,
          buyCount: 0,
          sellCount: 0,
          totalBuyAmount: 0,
          totalSellAmount: 0,
          totalBuyQuantity: 0,
          totalSellQuantity: 0,
        };
      }

      const stat = stockStats[trade.stockCode];
      const price = Number(trade.price);
      const amount = price * trade.quantity;

      if (trade.direction === 'BUY') {
        stat.buyCount++;
        stat.totalBuyAmount += amount;
        stat.totalBuyQuantity += trade.quantity;
      } else {
        stat.sellCount++;
        stat.totalSellAmount += amount;
        stat.totalSellQuantity += trade.quantity;
      }
    });

    // 计算每只股票的盈亏
    const stockSummaries = Object.values(stockStats).map((stat) => {
      const avgBuyPrice = stat.totalBuyQuantity > 0 ? stat.totalBuyAmount / stat.totalBuyQuantity : 0;
      const avgSellPrice = stat.totalSellQuantity > 0 ? stat.totalSellAmount / stat.totalSellQuantity : 0;
      const realizedProfit = stat.totalSellAmount - (avgBuyPrice * stat.totalSellQuantity);
      const holdingQuantity = stat.totalBuyQuantity - stat.totalSellQuantity;

      return {
        ...stat,
        avgBuyPrice,
        avgSellPrice,
        realizedProfit,
        holdingQuantity,
        holdingCost: holdingQuantity > 0 ? avgBuyPrice * holdingQuantity : 0,
      };
    });

    // 总体统计
    const totalStats = {
      totalTrades: trades.length,
      totalBuyTrades: trades.filter((t) => t.direction === 'BUY').length,
      totalSellTrades: trades.filter((t) => t.direction === 'SELL').length,
      totalBuyAmount: stockSummaries.reduce((sum, s) => sum + s.totalBuyAmount, 0),
      totalSellAmount: stockSummaries.reduce((sum, s) => sum + s.totalSellAmount, 0),
      totalRealizedProfit: stockSummaries.reduce((sum, s) => sum + s.realizedProfit, 0),
      uniqueStocks: Object.keys(stockStats).length,
    };

    return {
      stockSummaries: stockSummaries.sort((a, b) => b.realizedProfit - a.realizedProfit),
      totalStats,
    };
  }
}