import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TradeService } from '../services/trade.service';
import { AuthRequest, ApiError } from '../middlewares';

export class TradeController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const trade = await TradeService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filter = {
        diaryId: req.query.diaryId as string | undefined,
        stockCode: req.query.stockCode as string | undefined,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const result = await TradeService.findAll(req.userId, filter, page, limit);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const trade = await TradeService.findById(req.userId, id);

      res.json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const trade = await TradeService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await TradeService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取单只股票的交易历史
  static async getStockHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const stockCode = req.params.stockCode as string;
      if (!stockCode) {
        throw new ApiError(400, '股票代码不能为空');
      }

      const result = await TradeService.getStockHistory(req.userId, stockCode);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取交易统计概览
  static async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const result = await TradeService.getTradeStatistics(req.userId, startDate, endDate);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取交易日历数据
  static async getCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const result = await TradeService.getTradeCalendar(req.userId, year, month);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}