import { Response } from 'express';
import { tradingDashboardService } from '../services/tradingDashboard.service';
import { AuthRequest } from '../middlewares';

export class TradingDashboardController {
  static async getMetrics(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const { startDate, endDate } = req.query;
      const data = await tradingDashboardService.getMetrics(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取指标失败' });
    }
  }

  static async getDrawdownCurve(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const { startDate, endDate } = req.query;
      const data = await tradingDashboardService.getDrawdownCurve(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取回撤曲线失败' });
    }
  }

  static async getStreakHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await tradingDashboardService.getStreakHistory(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取连续记录失败' });
    }
  }
}
