import { Request, Response } from 'express';
import { strategyTemplateService } from '../services/strategyTemplate.service';

export class StrategyTemplateController {
  static async getTemplates(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await strategyTemplateService.getTemplates(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取策略模板失败' });
    }
  }

  static async getByCategory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { category } = req.params;
      const data = await strategyTemplateService.getByCategory(userId, category);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取策略模板失败' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await strategyTemplateService.create(userId, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '创建策略模板失败' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { id } = req.params;
      const data = await strategyTemplateService.update(userId, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新策略模板失败' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { id } = req.params;
      await strategyTemplateService.delete(userId, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除策略模板失败' });
    }
  }
}
