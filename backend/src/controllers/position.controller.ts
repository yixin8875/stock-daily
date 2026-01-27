import { Response, NextFunction } from 'express';
import { PositionService } from '../services/position.service';
import { AuthRequest, ApiError } from '../middlewares';

export class PositionController {
  /**
   * 获取所有持仓
   */
  static async getPositions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const positions = await PositionService.getPositions(req.userId!);
      res.json({ success: true, data: positions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加持仓
   */
  static async addPosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { stockCode, stockName, quantity, costPrice, targetPrice, stopPrice, notes } = req.body;

      if (!stockCode || !stockName || !quantity || !costPrice) {
        throw new ApiError(400, 'Missing required fields');
      }

      const position = await PositionService.addPosition(req.userId!, {
        stockCode,
        stockName,
        quantity,
        costPrice,
        targetPrice,
        stopPrice,
        notes,
      });

      res.json({ success: true, data: position });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新持仓
   */
  static async updatePosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const position = await PositionService.updatePosition(req.userId!, id, req.body);
      res.json({ success: true, data: position });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 减仓
   */
  static async reducePosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        throw new ApiError(400, 'Invalid quantity');
      }

      const position = await PositionService.reducePosition(req.userId!, id, quantity);
      res.json({ success: true, data: position });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除持仓
   */
  static async deletePosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await PositionService.deletePosition(req.userId!, id);
      res.json({ success: true, message: 'Position deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取持仓汇总
   */
  static async getPositionSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await PositionService.getPositionSummary(req.userId!);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
