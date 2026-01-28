import { Response } from 'express';
import { behaviorAnalysisService } from '../services/behaviorAnalysis.service';
import { AuthRequest } from '../middlewares';

export class BehaviorController {
  static async getPatterns(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await behaviorAnalysisService.getTradingPatterns(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取交易模式失败' });
    }
  }

  static async getBiases(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await behaviorAnalysisService.detectBehaviorBiases(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取行为偏差失败' });
    }
  }

  static async getHabits(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await behaviorAnalysisService.getTradingHabits(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取交易习惯失败' });
    }
  }
}
