import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { dividendService } from '../services/dividend.service'

export const dividendController = {
  async getDividends(req: AuthRequest, res: Response) {
    try {
      const dividends = await dividendService.getDividends(req.userId!)
      res.json({ success: true, data: dividends })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取分红记录失败' })
    }
  },

  async createDividend(req: AuthRequest, res: Response) {
    try {
      const dividend = await dividendService.createDividend(req.userId!, req.body)
      res.json({ success: true, data: dividend })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建分红记录失败' })
    }
  },

  async updateDividend(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const dividend = await dividendService.updateDividend(req.userId!, id as string, req.body)
      res.json({ success: true, data: dividend })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新分红记录失败' })
    }
  },

  async deleteDividend(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await dividendService.deleteDividend(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除分红记录失败' })
    }
  },
}
