import { Response, NextFunction } from 'express';
import { BacktestService } from '../services/backtest.service';
import { AuthRequest, ApiError } from '../middlewares';

export class BacktestController {
  /**
   * 运行策略回测
   */
  static async runBacktest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { strategyType, startDate, endDate } = req.query;

      const result = await BacktestService.runBacktest(
        req.userId,
        (strategyType as string) || 'all',
        startDate as string | undefined,
        endDate as string | undefined
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
