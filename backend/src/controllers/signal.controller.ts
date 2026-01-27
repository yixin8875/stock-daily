import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { signalService } from '../services/signal.service'

export const signalController = {
  async getSignals(req: AuthRequest, res: Response) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true'
      const signals = await signalService.getSignals(req.userId!, unreadOnly)
      res.json({ success: true, data: signals })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取信号失败' })
    }
  },

  async createSignal(req: AuthRequest, res: Response) {
    try {
      const signal = await signalService.createSignal(req.userId!, req.body)
      res.json({ success: true, data: signal })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建信号失败' })
    }
  },

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      const signal = await signalService.markAsRead(req.userId!, id)
      res.json({ success: true, data: signal })
    } catch (error) {
      res.status(500).json({ success: false, message: '标记失败' })
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await signalService.markAllAsRead(req.userId!)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '标记失败' })
    }
  },

  async deleteSignal(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      await signalService.deleteSignal(req.userId!, id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  },
}
