import { Response } from 'express';
import { aiAnalysisService } from '../services/aiAnalysis.service';
import { AuthRequest } from '../middlewares';

export class AIAnalysisController {
  static async getReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const data = await aiAnalysisService.generateReport();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '生成AI分析报告失败' });
    }
  }

  static async setConfig(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });

      const { apiKey, model, baseUrl } = req.body;
      aiAnalysisService.setConfig({ apiKey, model, baseUrl });
      res.json({ success: true, message: '配置已更新' });
    } catch (error) {
      res.status(500).json({ success: false, message: '配置更新失败' });
    }
  }
}
