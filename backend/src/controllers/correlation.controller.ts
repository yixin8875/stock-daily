import { Response } from 'express';
import { correlationAnalysisService } from '../services/correlationAnalysis.service';
import { AuthRequest } from '../middlewares';

export class CorrelationController {
  static async getCorrelations(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await correlationAnalysisService.analyzeCorrelations(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取相关性分析失败' });
    }
  }

  static async getDiversification(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await correlationAnalysisService.getDiversificationScore(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取分散度评分失败' });
    }
  }
}
