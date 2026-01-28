import { Request, Response } from 'express';
import { watchlistGroupService } from '../services/watchlistGroup.service';

export class WatchlistGroupController {
  static async getGroups(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await watchlistGroupService.getGroups(userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取分组失败' });
    }
  }

  static async createGroup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const data = await watchlistGroupService.createGroup(userId, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '创建分组失败' });
    }
  }

  static async updateGroup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { id } = req.params;
      const data = await watchlistGroupService.updateGroup(userId, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新分组失败' });
    }
  }

  static async deleteGroup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { id } = req.params;
      await watchlistGroupService.deleteGroup(userId, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除分组失败' });
    }
  }

  static async moveStock(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: '未授权' });
      const { stockCode, groupId } = req.body;
      const data = await watchlistGroupService.moveStock(userId, stockCode, groupId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: '移动股票失败' });
    }
  }
}
