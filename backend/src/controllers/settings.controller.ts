import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { settingsService } from '../services/settings.service'

export const settingsController = {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.getSettings(req.userId!)
      res.json({ success: true, data: settings })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取设置失败' })
    }
  },

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.updateSettings(req.userId!, req.body)
      res.json({ success: true, data: settings })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新设置失败' })
    }
  },
}
