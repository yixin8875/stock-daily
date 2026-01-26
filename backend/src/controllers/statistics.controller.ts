import { Response, NextFunction } from 'express';
import { StatisticsService } from '../services/statistics.service';
import { AuthRequest, ApiError } from '../middlewares';

// 根据period参数计算日期范围
function getDateRangeByPeriod(period?: string): { startDate?: Date; endDate?: Date } {
  if (!period || period === 'all') {
    return {};
  }

  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return {};
  }

  return { startDate, endDate };
}

export class StatisticsController {
  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.query.period as string | undefined;
      const { startDate, endDate } = getDateRangeByPeriod(period);

      const summary = await StatisticsService.getSummary(
        req.userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfitCurve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const profitCurve = await StatisticsService.getProfitCurve(
        req.userId,
        period,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: profitCurve,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTradeStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.query.period as string | undefined;
      const { startDate, endDate } = getDateRangeByPeriod(period);

      const tradeStats = await StatisticsService.getTradeStatistics(
        req.userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: tradeStats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyProfit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.query.period as string | undefined;
      const { startDate, endDate } = getDateRangeByPeriod(period);

      const monthlyProfit = await StatisticsService.getMonthlyProfit(
        req.userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: monthlyProfit,
      });
    } catch (error) {
      next(error);
    }
  }
}
