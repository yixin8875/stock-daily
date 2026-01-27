import { Response, NextFunction } from 'express';
import { AlertService } from '../services/alert.service';
import { AuthRequest, ApiError } from '../middlewares';

export class AlertController {
  /**
   * 获取所有提醒
   */
  static async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const includeTriggered = req.query.includeTriggered === 'true';
      const alerts = await AlertService.getAlerts(req.userId!, includeTriggered);
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建提醒
   */
  static async createAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { positionId, stockCode, stockName, alertType, targetPrice, notes } = req.body;

      if (!stockCode || !stockName || !alertType || !targetPrice) {
        throw new ApiError(400, 'Missing required fields');
      }

      const alert = await AlertService.createAlert(req.userId!, {
        positionId,
        stockCode,
        stockName,
        alertType,
        targetPrice,
        notes,
      });

      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新提醒
   */
  static async updateAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const alert = await AlertService.updateAlert(req.userId!, id, req.body);
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除提醒
   */
  static async deleteAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await AlertService.deleteAlert(req.userId!, id);
      res.json({ success: true, message: 'Alert deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 检查提醒
   */
  static async checkAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quotes } = req.body;

      if (!quotes || !Array.isArray(quotes)) {
        throw new ApiError(400, 'Invalid quotes data');
      }

      const triggered = await AlertService.checkAlerts(req.userId!, quotes);
      res.json({ success: true, data: triggered });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置提醒
   */
  static async resetAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const alert = await AlertService.resetAlert(req.userId!, id);
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }
}
