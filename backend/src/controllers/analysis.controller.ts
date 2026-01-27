import { Response, NextFunction } from 'express';
import { AIAnalysisService } from '../services/analysis.service';
import { AuthRequest, ApiError } from '../middlewares';

export class AnalysisController {
  /**
   * 获取AI分析结果
   */
  static async getAnalysis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const analysis = await AIAnalysisService.getAnalysis(req.userId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
}
