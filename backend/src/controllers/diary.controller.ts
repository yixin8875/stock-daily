import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { DiaryService } from '../services';
import { AuthRequest, ApiError } from '../middlewares';

export class DiaryController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const diary = await DiaryService.create(req.userId, {
        ...req.body,
        date: new Date(req.body.date),
      });

      res.status(201).json({
        success: true,
        data: diary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const date = req.params.date as string;
      const diary = await DiaryService.findByDate(req.userId, new Date(date));

      // 返回null而不是404，让前端处理空状态
      res.json({
        success: true,
        data: diary || null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const result = await DiaryService.findAll(
        req.userId,
        page,
        limit,
        startDate,
        endDate
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const diary = await DiaryService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: diary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await DiaryService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get calendar data for a specific month
   * GET /api/diaries/calendar?year=2026&month=1
   */
  static async getCalendarData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      if (!year || !month || month < 1 || month > 12) {
        throw new ApiError(400, 'Invalid year or month parameter');
      }

      const calendarData = await DiaryService.getCalendarData(req.userId, year, month);

      res.json({
        success: true,
        data: calendarData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete diary detail for a specific date
   * GET /api/diaries/detail/:date
   */
  static async getDetailByDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const dateStr = req.params.date as string;
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid date format');
      }

      const detail = await DiaryService.getDetailByDate(req.userId, date);

      // 返回空数据而不是404，让前端处理空状态
      res.json({
        success: true,
        data: detail || { summary: null, plan: null },
      });
    } catch (error) {
      next(error);
    }
  }
}
