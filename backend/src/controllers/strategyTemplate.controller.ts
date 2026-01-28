import { Response } from 'express';
import { strategyTemplateService } from '../services/strategyTemplate.service';
import { AuthRequest } from '../middlewares';

export class StrategyTemplateController {
  static async getTemplates(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await strategyTemplateService.getTemplates(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取策略模板失败' });
    }
  }

  static async getByCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const category = req.params.category as string;
      const data = await strategyTemplateService.getByCategory(userId, category);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取策略模板失败' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await strategyTemplateService.create(userId, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '创建策略模板失败' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const id = req.params.id as string;
      const data = await strategyTemplateService.update(userId, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新策略模板失败' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const id = req.params.id as string;
      await strategyTemplateService.delete(userId, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除策略模板失败' });
    }
  }
}
