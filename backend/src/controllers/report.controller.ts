import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuthRequest, ApiError } from '../middlewares';

export class ReportController {
  /**
   * 获取周报或月报
   * GET /api/reports/:period?date=2026-01-27
   */
  static async getReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.params.period as 'week' | 'month';
      if (period !== 'week' && period !== 'month') {
        throw new ApiError(400, 'Invalid period. Must be "week" or "month"');
      }

      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : new Date();

      if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid date format');
      }

      const report = await ReportService.getReport(req.userId, period, date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取报告列表
   * GET /api/reports/:period/list?limit=10
   */
  static async getReportList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.params.period as 'week' | 'month';
      if (period !== 'week' && period !== 'month') {
        throw new ApiError(400, 'Invalid period. Must be "week" or "month"');
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const reports = await ReportService.getReportList(req.userId, period, limit);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 导出报告为 Excel
   * GET /api/reports/:period/export?date=2026-01-27
   */
  static async exportReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const period = req.params.period as 'week' | 'month';
      if (period !== 'week' && period !== 'month') {
        throw new ApiError(400, 'Invalid period. Must be "week" or "month"');
      }

      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : new Date();

      if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid date format');
      }

      const buffer = await ReportService.exportReport(req.userId, period, date);

      const periodLabel = period === 'week' ? '周报' : '月报';
      const dateLabel = date.toISOString().split('T')[0];
      const filename = encodeURIComponent(`交易${periodLabel}_${dateLabel}.xlsx`);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
