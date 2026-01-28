import { Request, Response } from 'express';
import { MarketService } from '../services/market.service';

export class MarketController {
  /**
   * 获取龙虎榜数据
   */
  static async getDragonTiger(req: Request, res: Response) {
    try {
      const { date } = req.query;
      const data = await MarketService.getDragonTiger(date as string);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取龙虎榜数据失败' });
    }
  }

  /**
   * 获取机构交易数据
   */
  static async getInstitutionTrades(req: Request, res: Response) {
    try {
      const { date } = req.query;
      const data = await MarketService.getInstitutionTrades(date as string);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取机构交易数据失败' });
    }
  }

  /**
   * 获取北向资金流入数据
   */
  static async getNorthFlow(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 10;
      const data = await MarketService.getNorthFlow(days);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取北向资金数据失败' });
    }
  }

  /**
   * 获取北向资金买入TOP股票
   */
  static async getNorthTopStocks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await MarketService.getNorthTopStocks(limit);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取北向资金TOP股票失败' });
    }
  }

  /**
   * 获取板块列表
   */
  static async getSectors(req: Request, res: Response) {
    try {
      const data = await MarketService.getSectors();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取板块数据失败' });
    }
  }

  /**
   * 获取板块轮动数据
   */
  static async getSectorRotation(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 5;
      const data = await MarketService.getSectorRotation(days);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取板块轮动数据失败' });
    }
  }

  /**
   * 获取市场情绪指标
   */
  static async getMarketSentiment(req: Request, res: Response) {
    try {
      const data = await MarketService.getMarketSentiment();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取市场情绪失败' });
    }
  }

  /**
   * 获取资金流向数据
   */
  static async getMoneyFlow(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await MarketService.getMoneyFlow(limit);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取资金流向失败' });
    }
  }
}
