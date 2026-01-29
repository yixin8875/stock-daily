import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { SignalGeneratorService } from '../services/signalGenerator.service';
import { signalService } from '../services/signal.service';

export const signalGeneratorController = {
  // 为单只股票生成信号
  async generateForStock(req: AuthRequest, res: Response) {
    try {
      const { stockCode, stockName, klines } = req.body;

      if (!stockCode || !stockName || !klines) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数'
        });
      }

      const signals = SignalGeneratorService.generateSignals(
        klines,
        stockCode,
        stockName
      );

      res.json({ success: true, data: signals });
    } catch (error) {
      res.status(500).json({ success: false, message: '生成信号失败' });
    }
  },

  // 保存生成的信号
  async saveSignals(req: AuthRequest, res: Response) {
    try {
      const { signals } = req.body;

      if (!signals || !Array.isArray(signals)) {
        return res.status(400).json({
          success: false,
          message: '信号数据无效'
        });
      }

      await SignalGeneratorService.saveSignals(req.userId!, signals);
      res.json({ success: true, message: `保存了 ${signals.length} 个信号` });
    } catch (error) {
      res.status(500).json({ success: false, message: '保存信号失败' });
    }
  },

  // 获取信号配置
  async getConfig(req: AuthRequest, res: Response) {
    try {
      const config = {
        macdEnabled: true,
        kdjEnabled: true,
        rsiEnabled: true,
        maEnabled: true,
        bollEnabled: true,
      };
      res.json({ success: true, data: config });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取配置失败' });
    }
  },
};
