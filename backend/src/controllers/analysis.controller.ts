import { Response, NextFunction } from 'express';
import { AnalysisService } from '../services/analysis.service';
import { AuthRequest, ApiError } from '../middlewares';

export class AnalysisController {
  /**
   * 获取收益曲线
   */
  static async getProfitCurve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const curve = await AnalysisService.getProfitCurve(
        req.userId!,
        startDate as string,
        endDate as string
      );

      // 计算最大回撤
      const drawdown = AnalysisService.calculateMaxDrawdown(curve);

      res.json({
        success: true,
        data: {
          curve,
          drawdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取交易复盘
   */
  static async getTradeReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const reviews = await AnalysisService.getTradeReviews(
        req.userId!,
        startDate as string,
        endDate as string
      );

      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 生成周报/月报
   */
  static async generateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { periodType, date } = req.query;

      if (!periodType || !['week', 'month'].includes(periodType as string)) {
        throw new ApiError(400, 'Invalid period type');
      }

      const report = await AnalysisService.generateReport(
        req.userId!,
        periodType as 'week' | 'month',
        date as string
      );

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
}
