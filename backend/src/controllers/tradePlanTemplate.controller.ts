import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { tradePlanTemplateService } from '../services/tradePlanTemplate.service'

export const tradePlanTemplateController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const data = await tradePlanTemplateService.getAll(req.userId!)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取交易计划失败' })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = await tradePlanTemplateService.create(req.userId!, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建交易计划失败' })
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const data = await tradePlanTemplateService.update(req.userId!, id as string, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新交易计划失败' })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await tradePlanTemplateService.delete(req.userId!, id as string)
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除交易计划失败' })
    }
  },
}
