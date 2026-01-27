import { Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { AuthRequest, ApiError } from '../middlewares';

export class ReminderController {
  /**
   * 获取今日提醒
   * GET /api/reminders/today
   */
  static async getTodayReminders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const reminders = await ReminderService.getTodayReminders(req.userId);
      res.json(reminders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取待执行计划
   * GET /api/reminders/pending
   */
  static async getPendingPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const plans = await ReminderService.getPendingPlans(req.userId);
      res.json(plans);
    } catch (error) {
      next(error);
    }
  }
}
