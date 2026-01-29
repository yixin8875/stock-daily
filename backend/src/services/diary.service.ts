import { prisma } from '../app';
import { ApiError } from '../middlewares';
import { MarketTrend, MarketVolume, Emotion, LearningCategory } from '@prisma/client';

// 枚举值转换函数
const toMarketTrend = (value?: string): MarketTrend | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(MarketTrend).includes(upper as MarketTrend)) {
    return upper as MarketTrend;
  }
  return undefined;
};

const toMarketVolume = (value?: string): MarketVolume | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(MarketVolume).includes(upper as MarketVolume)) {
    return upper as MarketVolume;
  }
  return undefined;
};

const toEmotion = (value?: string): Emotion | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(Emotion).includes(upper as Emotion)) {
    return upper as Emotion;
  }
  return undefined;
};

const toLearningCategory = (value?: string): LearningCategory | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(LearningCategory).includes(upper as LearningCategory)) {
    return upper as LearningCategory;
  }
  return undefined;
};

export interface CreateDiaryInput {
  date: Date;
  marketTrend?: string;
  marketVolume?: string;
  marketComment?: string;
  hotSectors?: string[];
  profitLossAmount?: number;
  profitLossPercent?: number;
  totalAssets?: number;
  reflectionGood?: string;
  reflectionBad?: string;
  reflectionImprove?: string;
  reflectionTags?: string[];
  emotionBefore?: string;
  emotionDuring?: string;
  emotionAfter?: string;
  emotionNote?: string;
  learningNote?: string;
  learningCategory?: string;
  riskNotes?: string;
}

export class DiaryService {
  static async create(userId: string, input: CreateDiaryInput) {
    // Check if diary already exists for this date and user
    const existingDiary = await prisma.diary.findFirst({
      where: {
        userId,
        date: input.date,
      },
    });

    // If diary exists, update it instead of creating a new one (upsert behavior)
    if (existingDiary) {
      return this.update(userId, existingDiary.id, input);
    }

    const diary = await prisma.diary.create({
      data: {
        user: { connect: { id: userId } },
        date: input.date,
        marketTrend: toMarketTrend(input.marketTrend),
        marketVolume: toMarketVolume(input.marketVolume),
        marketComment: input.marketComment,
        hotSectors: input.hotSectors,
        profitLossAmount: input.profitLossAmount,
        profitLossPercent: input.profitLossPercent,
        totalAssets: input.totalAssets,
        reflectionGood: input.reflectionGood,
        reflectionBad: input.reflectionBad,
        reflectionImprove: input.reflectionImprove,
        reflectionTags: input.reflectionTags,
        emotionBefore: toEmotion(input.emotionBefore),
        emotionDuring: toEmotion(input.emotionDuring),
        emotionAfter: toEmotion(input.emotionAfter),
        emotionNote: input.emotionNote,
        learningNote: input.learningNote,
        learningCategory: toLearningCategory(input.learningCategory),
        riskNotes: input.riskNotes,
      },
      include: {
        trades: true,
        watchStocks: true,
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
      },
    });

    return diary;
  }

  static async findByDate(userId: string, date: Date) {
    const diary = await prisma.diary.findFirst({
      where: {
        userId,
        date,
      },
      include: {
        trades: true,
        watchStocks: true,
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
      },
    });

    return diary;
  }

  static async findAll(
    userId: string,
    page = 1,
    limit = 10,
    startDate?: Date,
    endDate?: Date
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = startDate;
      }
      if (endDate) {
        whereClause.date.lte = endDate;
      }
    }

    const [diaries, total] = await Promise.all([
      prisma.diary.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          trades: true,
          watchStocks: true,
          buyPlans: true,
          sellPlans: true,
          stopLosses: true,
        },
      }),
      prisma.diary.count({ where: whereClause }),
    ]);

    return {
      data: diaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(userId: string, id: string, input: Partial<CreateDiaryInput>) {
    // Check if diary exists and belongs to user
    const diary = await prisma.diary.findFirst({
      where: { id, userId },
    });

    if (!diary) {
      throw new ApiError(404, 'Diary not found');
    }

    const updateData: any = { ...input };
    if (input.marketTrend !== undefined) {
      updateData.marketTrend = toMarketTrend(input.marketTrend);
    }
    if (input.marketVolume !== undefined) {
      updateData.marketVolume = toMarketVolume(input.marketVolume);
    }
    if (input.emotionBefore !== undefined) {
      updateData.emotionBefore = toEmotion(input.emotionBefore);
    }
    if (input.emotionDuring !== undefined) {
      updateData.emotionDuring = toEmotion(input.emotionDuring);
    }
    if (input.emotionAfter !== undefined) {
      updateData.emotionAfter = toEmotion(input.emotionAfter);
    }
    if (input.learningCategory !== undefined) {
      updateData.learningCategory = toLearningCategory(input.learningCategory);
    }

    const updatedDiary = await prisma.diary.update({
      where: { id },
      data: updateData,
      include: {
        trades: true,
        watchStocks: true,
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
      },
    });

    return updatedDiary;
  }

  static async delete(userId: string, id: string) {
    // Check if diary exists and belongs to user
    const diary = await prisma.diary.findFirst({
      where: { id, userId },
    });

    if (!diary) {
      throw new ApiError(404, 'Diary not found');
    }

    await prisma.diary.delete({
      where: { id },
    });

    return { message: 'Diary deleted successfully' };
  }

  /**
   * Get calendar data for a specific month
   * Returns summary data for each day that has a diary record
   */
  static async getCalendarData(userId: string, year: number, month: number) {
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch all diaries for the month with trade counts
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        profitLossAmount: true,
        profitLossPercent: true,
        _count: {
          select: {
            trades: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Transform to calendar data format
    const calendarData: Record<string, {
      date: string;
      hasRecord: boolean;
      todayProfit: number | null;
      todayProfitRate: number | null;
      tradeCount: number;
    }> = {};

    for (const diary of diaries) {
      const dateStr = diary.date.toISOString().split('T')[0];
      calendarData[dateStr] = {
        date: dateStr,
        hasRecord: true,
        todayProfit: diary.profitLossAmount ? Number(diary.profitLossAmount) : null,
        todayProfitRate: diary.profitLossPercent ? Number(diary.profitLossPercent) : null,
        tradeCount: diary._count.trades,
      };
    }

    return calendarData;
  }

  /**
   * Get complete diary detail for a specific date
   * Includes summary (diary main data + trades) and plan (watchStocks, buyPlans, sellPlans, stopLosses)
   */
  static async getDetailByDate(userId: string, date: Date) {
    const diary = await prisma.diary.findFirst({
      where: {
        userId,
        date,
      },
      include: {
        trades: {
          orderBy: { createdAt: 'asc' },
        },
        watchStocks: {
          orderBy: { createdAt: 'asc' },
        },
        buyPlans: {
          orderBy: { createdAt: 'asc' },
        },
        sellPlans: {
          orderBy: { createdAt: 'asc' },
        },
        stopLosses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!diary) {
      return null;
    }

    // Separate summary and plan data
    const { watchStocks, buyPlans, sellPlans, stopLosses, ...summaryData } = diary;

    return {
      summary: summaryData,
      plan: {
        watchStocks,
        buyPlans,
        sellPlans,
        stopLosses,
      },
    };
  }
}
