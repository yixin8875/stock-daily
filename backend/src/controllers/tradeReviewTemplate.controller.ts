import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { tradeReviewTemplateService } from '../services/tradeReviewTemplate.service'

export const tradeReviewTemplateController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const data = await tradeReviewTemplateService.getAll(req.userId!)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取复盘记录失败' })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = await tradeReviewTemplateService.create(req.userId!, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建复盘记录失败' })
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = await tradeReviewTemplateService.update(req.userId!, req.params.id, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新复盘记录失败' })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await tradeReviewTemplateService.delete(req.userId!, req.params.id)
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除复盘记录失败' })
    }
  },
}
