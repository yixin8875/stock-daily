import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { twoFactorService } from '../services/twoFactor.service';

export const twoFactorController = {
  async setup(req: AuthRequest, res: Response) {
    try {
      const result = await twoFactorService.enableTwoFactor(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: '设置2FA失败' });
    }
  },

  async confirm(req: AuthRequest, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: '请输入验证码' });
      }
      const success = await twoFactorService.confirmTwoFactor(req.userId!, token);
      if (!success) {
        return res.status(400).json({ success: false, message: '验证码错误' });
      }
      res.json({ success: true, message: '2FA已启用' });
    } catch (error) {
      res.status(500).json({ success: false, message: '确认失败' });
    }
  },

  async disable(req: AuthRequest, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: '请输入验证码' });
      }
      const success = await twoFactorService.disableTwoFactor(req.userId!, token);
      if (!success) {
        return res.status(400).json({ success: false, message: '验证码错误' });
      }
      res.json({ success: true, message: '2FA已禁用' });
    } catch (error) {
      res.status(500).json({ success: false, message: '禁用失败' });
    }
  },

  async status(req: AuthRequest, res: Response) {
    try {
      const enabled = await twoFactorService.isTwoFactorEnabled(req.userId!);
      res.json({ success: true, data: { enabled } });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取状态失败' });
    }
  },
};
