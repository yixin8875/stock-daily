import { Request, Response } from 'express';
import { IndicatorService, KLineData } from '../services/indicator.service';

export class IndicatorController {
  /**
   * 计算技术指标
   */
  static async calculate(req: Request, res: Response) {
    try {
      const { klines } = req.body;

      if (!klines || !Array.isArray(klines) || klines.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'K线数据不能为空',
        });
      }

      const data = IndicatorService.calcAll(klines as KLineData[]);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '计算技术指标失败',
      });
    }
  }

  /**
   * 计算 MACD
   */
  static async calcMACD(req: Request, res: Response) {
    try {
      const { klines } = req.body;
      const data = IndicatorService.calcMACD(klines as KLineData[]);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '计算MACD失败' });
    }
  }

  /**
   * 计算 KDJ
   */
  static async calcKDJ(req: Request, res: Response) {
    try {
      const { klines, n } = req.body;
      const data = IndicatorService.calcKDJ(klines as KLineData[], n);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '计算KDJ失败' });
    }
  }

  /**
   * 计算 RSI
   */
  static async calcRSI(req: Request, res: Response) {
    try {
      const { klines } = req.body;
      const data = IndicatorService.calcRSI(klines as KLineData[]);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '计算RSI失败' });
    }
  }

  /**
   * 计算 MA
   */
  static async calcMA(req: Request, res: Response) {
    try {
      const { klines } = req.body;
      const data = IndicatorService.calcMA(klines as KLineData[]);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '计算MA失败' });
    }
  }

  /**
   * 计算布林带
   */
  static async calcBOLL(req: Request, res: Response) {
    try {
      const { klines, n, k } = req.body;
      const data = IndicatorService.calcBOLL(klines as KLineData[], n, k);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '计算布林带失败' });
    }
  }
}
