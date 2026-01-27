import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest, ApiError } from '../middlewares';

export class ReviewController {
  /**
   * 获取某一天的复盘数据
   * GET /api/review/daily?date=2026-01-27
   */
  static async getDailyReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : new Date();

      if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid date format');
      }

      const review = await ReviewService.getDailyReview(req.userId, date);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取偏离度趋势
   * GET /api/review/trend?startDate=2026-01-01&endDate=2026-01-31&limit=30
   */
  static async getDeviationTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;

      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }

      const trend = await ReviewService.getDeviationTrend(
        req.userId,
        startDate,
        endDate,
        limit
      );
      res.json(trend);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取有复盘数据的日期列表
   * GET /api/review/dates?startDate=2026-01-01&endDate=2026-01-31
   */
  static async getReviewDates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }

      const dates = await ReviewService.getReviewDates(req.userId, startDate, endDate);
      res.json(dates);
    } catch (error) {
      next(error);
    }
  }
}
