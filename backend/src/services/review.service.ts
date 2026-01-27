import { prisma } from '../app';

export interface ExecutionMetrics {
  planCount: number;
  executedCount: number;
  executionRate: number;
  avgDeviation: number;
  onTargetCount: number;
  missedCount: number;
}

export interface PlanExecutionPair {
  planType: 'buy' | 'sell';
  stockCode: string;
  stockName: string;
  plannedPrice: number;
  actualPrice: number | null;
  plannedQuantity: number;
  actualQuantity: number | null;
  deviation: number | null;
  status: 'executed' | 'partial' | 'missed' | 'pending';
  planReason: string | null;
  tradeReason: string | null;
}

export interface DailyReview {
  date: string;
  metrics: ExecutionMetrics;
  pairs: PlanExecutionPair[];
  summary: {
    totalPlannedAmount: number;
    totalActualAmount: number;
    profitFromPlan: number;
  };
}

export interface DeviationTrend {
  date: string;
  avgDeviation: number;
  executionRate: number;
}

export class ReviewService {
  /**
   * 获取某一天的复盘数据
   */
  static async getDailyReview(userId: string, date: Date): Promise<DailyReview> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 获取前一天的计划（明日计划）
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevStartOfDay = new Date(previousDay);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDay);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // 获取前一天的日记（包含明日计划）
    const previousDiary = await prisma.diary.findFirst({
      where: {
        userId,
        date: {
          gte: prevStartOfDay,
          lte: prevEndOfDay,
        },
      },
      include: {
        buyPlans: true,
        sellPlans: true,
      },
    });

    // 获取当天的日记（包含实际交易）
    const todayDiary = await prisma.diary.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        trades: true,
      },
    });

    const pairs: PlanExecutionPair[] = [];
    let executedCount = 0;
    let totalDeviation = 0;
    let deviationCount = 0;
    let onTargetCount = 0;
    let missedCount = 0;
    let totalPlannedAmount = 0;
    let totalActualAmount = 0;

    // 处理买入计划
    if (previousDiary?.buyPlans) {
      for (const plan of previousDiary.buyPlans) {
        const plannedPrice = Number(plan.targetPrice);
        const plannedQuantity = Math.round(Number(plan.positionPercent) * 100);
        totalPlannedAmount += plannedPrice * plannedQuantity;

        // 查找对应的实际交易
        const matchingTrade = todayDiary?.trades.find(
          t => t.stockCode === plan.stockCode && t.direction === 'BUY'
        );

        if (matchingTrade) {
          const actualPrice = Number(matchingTrade.price);
          const actualQuantity = matchingTrade.quantity;
          const deviation = ((actualPrice - plannedPrice) / plannedPrice) * 100;

          totalActualAmount += actualPrice * actualQuantity;
          totalDeviation += Math.abs(deviation);
          deviationCount++;
          executedCount++;

          if (Math.abs(deviation) <= 2) {
            onTargetCount++;
          }

          pairs.push({
            planType: 'buy',
            stockCode: plan.stockCode,
            stockName: plan.stockName,
            plannedPrice,
            actualPrice,
            plannedQuantity,
            actualQuantity,
            deviation: Math.round(deviation * 100) / 100,
            status: actualQuantity >= plannedQuantity ? 'executed' : 'partial',
            planReason: plan.buyReason,
            tradeReason: matchingTrade.reason,
          });
        } else {
          missedCount++;
          pairs.push({
            planType: 'buy',
            stockCode: plan.stockCode,
            stockName: plan.stockName,
            plannedPrice,
            actualPrice: null,
            plannedQuantity,
            actualQuantity: null,
            deviation: null,
            status: 'missed',
            planReason: plan.buyReason,
            tradeReason: null,
          });
        }
      }
    }

    // 处理卖出计划
    if (previousDiary?.sellPlans) {
      for (const plan of previousDiary.sellPlans) {
        const plannedPrice = Number(plan.targetPrice);
        const plannedQuantity = Math.round(Number(plan.sellPercent) * 100);
        totalPlannedAmount += plannedPrice * plannedQuantity;

        const matchingTrade = todayDiary?.trades.find(
          t => t.stockCode === plan.stockCode && t.direction === 'SELL'
        );

        if (matchingTrade) {
          const actualPrice = Number(matchingTrade.price);
          const actualQuantity = matchingTrade.quantity;
          const deviation = ((actualPrice - plannedPrice) / plannedPrice) * 100;

          totalActualAmount += actualPrice * actualQuantity;
          totalDeviation += Math.abs(deviation);
          deviationCount++;
          executedCount++;

          if (Math.abs(deviation) <= 2) {
            onTargetCount++;
          }

          pairs.push({
            planType: 'sell',
            stockCode: plan.stockCode,
            stockName: plan.stockName,
            plannedPrice,
            actualPrice,
            plannedQuantity,
            actualQuantity,
            deviation: Math.round(deviation * 100) / 100,
            status: actualQuantity >= plannedQuantity ? 'executed' : 'partial',
            planReason: plan.sellReason,
            tradeReason: matchingTrade.reason,
          });
        } else {
          missedCount++;
          pairs.push({
            planType: 'sell',
            stockCode: plan.stockCode,
            stockName: plan.stockName,
            plannedPrice,
            actualPrice: null,
            plannedQuantity,
            actualQuantity: null,
            deviation: null,
            status: 'missed',
            planReason: plan.sellReason,
            tradeReason: null,
          });
        }
      }
    }

    const planCount = (previousDiary?.buyPlans?.length || 0) + (previousDiary?.sellPlans?.length || 0);
    const executionRate = planCount > 0 ? (executedCount / planCount) * 100 : 0;
    const avgDeviation = deviationCount > 0 ? totalDeviation / deviationCount : 0;

    return {
      date: date.toISOString().split('T')[0],
      metrics: {
        planCount,
        executedCount,
        executionRate: Math.round(executionRate * 100) / 100,
        avgDeviation: Math.round(avgDeviation * 100) / 100,
        onTargetCount,
        missedCount,
      },
      pairs,
      summary: {
        totalPlannedAmount: Math.round(totalPlannedAmount * 100) / 100,
        totalActualAmount: Math.round(totalActualAmount * 100) / 100,
        profitFromPlan: Math.round((totalActualAmount - totalPlannedAmount) * 100) / 100,
      },
    };
  }

  /**
   * 获取偏离度趋势
   */
  static async getDeviationTrend(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 30
  ): Promise<DeviationTrend[]> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - limit * 24 * 60 * 60 * 1000);

    const trends: DeviationTrend[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const review = await this.getDailyReview(userId, new Date(currentDate));

      if (review.metrics.planCount > 0) {
        trends.push({
          date: review.date,
          avgDeviation: review.metrics.avgDeviation,
          executionRate: review.metrics.executionRate,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }

  /**
   * 获取有复盘数据的日期列表
   */
  static async getReviewDates(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<string[]> {
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

    // 获取有计划的日记
    const diariesWithPlans = await prisma.diary.findMany({
      where: {
        ...whereClause,
        OR: [
          { buyPlans: { some: {} } },
          { sellPlans: { some: {} } },
        ],
      },
      select: {
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // 返回计划日期的下一天（即执行日期）
    return diariesWithPlans.map(d => {
      const nextDay = new Date(d.date);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    });
  }
}
