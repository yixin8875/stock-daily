import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { earningsService } from '../services/earnings.service'

export const earningsController = {
  async getEarnings(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query
      const earnings = await earningsService.getEarnings(
        req.userId!,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
      res.json({ success: true, data: earnings })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取财报日历失败' })
    }
  },

  async getUpcoming(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30
      const earnings = await earningsService.getUpcoming(req.userId!, days)
      res.json({ success: true, data: earnings })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取即将发布的财报失败' })
    }
  },

  async addEarnings(req: AuthRequest, res: Response) {
    try {
      const data = {
        ...req.body,
        reportDate: new Date(req.body.reportDate),
      }
      const earnings = await earningsService.addEarnings(req.userId!, data)
      res.json({ success: true, data: earnings })
    } catch (error) {
      res.status(500).json({ success: false, message: '添加失败' })
    }
  },

  async updateEarnings(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      const data = req.body.reportDate
        ? { ...req.body, reportDate: new Date(req.body.reportDate) }
        : req.body
      const earnings = await earningsService.updateEarnings(req.userId!, id, data)
      res.json({ success: true, data: earnings })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  },

  async deleteEarnings(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      await earningsService.deleteEarnings(req.userId!, id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  },
}
