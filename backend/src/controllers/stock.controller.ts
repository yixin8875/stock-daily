import { Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { AuthRequest, ApiError } from '../middlewares';

export class StockController {
  /**
   * 获取单只股票行情
   */
  static async getQuote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;

      if (!code) {
        throw new ApiError(400, 'Stock code is required');
      }

      const quote = await StockService.getQuote(code);

      if (!quote) {
        throw new ApiError(404, 'Stock not found or market closed');
      }

      res.json({
        success: true,
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量获取股票行情
   */
  static async getQuotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { codes } = req.query;

      if (!codes || typeof codes !== 'string') {
        throw new ApiError(400, 'Stock codes are required');
      }

      const codeList = codes.split(',').map(c => c.trim()).filter(c => c);

      if (codeList.length === 0) {
        throw new ApiError(400, 'At least one stock code is required');
      }

      if (codeList.length > 50) {
        throw new ApiError(400, 'Maximum 50 stocks allowed');
      }

      const quotes = await StockService.getQuotes(codeList);

      res.json({
        success: true,
        data: quotes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索股票
   */
  static async searchStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { keyword } = req.query;

      if (!keyword || typeof keyword !== 'string') {
        throw new ApiError(400, 'Search keyword is required');
      }

      const results = await StockService.searchStock(keyword);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
